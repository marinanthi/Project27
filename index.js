const express = require("express");
const mysql = require("mysql2/promise");
var session = require("express-session");
const fs = require("node:fs");
const mysqldump = require("mysqldump");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000000 },
  })
);

var connection = null;
(async () => {
  connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mypass",
    database: "project27",
    multipleStatements: true,
  });
})();

app.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const [results, fields] = await connection.query(
      `SELECT ID, userType
      FROM user
      WHERE username = ? AND password= ?;`,
      [
        username,
        password
      ]
    );

    // console.log(results.length);

    if (results.length === 1) {
      req.session.loggedin = true;
      req.session.userType = results[0].userType;
      req.session.username = username;
      res.send("You are now logged in!");
    } else {
      res.send("Incorrect username or password!");
    }

  } catch (err) {
    return res.send(err);
  }

});

app.get("/backupdb", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  if (req.session.userType !== "admin") {
    return res.send("You are not an admin user");
  }
  const backupname = req.query.backupname;

  if (!backupname) {
    return res.send("Please provide a backup name");
  }

  if (!fs.existsSync("./db_dumps")) {
    fs.mkdirSync("./db_dumps");
  }

  mysqldump({
    connection: {
      host: "localhost",
      user: "root",
      password: "mypass",
      database: "project27",
    },
    dumpToFile: "./db_dumps/" + backupname + ".sql",
  });

  res.send("Backup created");
});

app.get("/getbackups", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  if (req.session.userType !== "admin") {
    return res.send("You are not an admin user");
  }

  fs.readdir("./db_dumps", (err, files) => {
    res.send(files);
  });
});

app.get("/restoredb", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  if (req.session.userType !== "admin") {
    return res.send("You are not an admin user");
  }

  const backupname = req.query.backupname;

  if (!backupname) {
    return res.send("Please provide a backup name");
  }

  try {
    await connection.query(`DROP DATABASE IF EXISTS project27;
    CREATE DATABASE project27;
    USE project27;`);
  } catch (err) {
    return res.send(err);
  }

  const sqlBackup = fs.readFileSync("./db_dumps/" + backupname, "utf8");

  try {
    await connection.query(sqlBackup);
    res.send("Backup restored");
  } catch (err) {
    return res.send(err);
  }
});

// pick 10 national cuisine, cook and recipe for every recipe
app.get("/createcontest", async function (req, res) {
  
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  if (req.session.userType !== "admin") {
    return res.send("You are not an admin user");
  }

  let episodes = [];
  let contestID;

  const contest_year = req.query.contest_year;

  if (!contest_year) {
    return res.send('You have to provide year.')
  }

  try {
    let [results, fields] = await connection.query(
      `SELECT * FROM contest WHERE contest_year = ? ;`,
      [
        contest_year
      ]
    );

    if (results.length > 0) {
      return res.send('This contest already exists.')
    }

    [results, fields] = await connection.query(
      `INSERT INTO contest(contest_year) 
      VALUES (?) ;`,
      [
        contest_year
      ]
    );

    contestID = results.insertId;

  } catch (err) {
    console.log(err);
  }

  try {

    for (let j = 0; j < 10; j++) {
      episodes.push({
        nationalCuisineIDs: [],
        cookIDs: [],
        judgeIDs: [],
        recipeIDs: [],
        epID: -1,
        epNo: j+1
      })

      const [results, fields] = await connection.query(
        `INSERT INTO episode (epNo, contestID) VALUES
        (?,?) ;`,
        [
          episodes[j].epNo,
          contestID
        ]
      );

      episodes[j].epID = results.insertId;
    }

    for (let e = 0; e < 10; e++) {

      let excludeNationalCuisinesIDs = []
      if (e === 0) {
        excludeNationalCuisinesIDs = [-1]
      }
      else {
        excludeNationalCuisinesIDs = episodes[e - 1].nationalCuisineIDs
      }
      const [results, fields] = await connection.query(
        `SELECT ncID 
        FROM national_cuisine nc 
        WHERE ncID NOT IN ( ? ) 
        ORDER BY RAND()
        LIMIT 10 ;`,
        [
          excludeNationalCuisinesIDs
        ]
      );

      episodes[e].nationalCuisineIDs = results;

      // Converting objects to numbers
      for (let i = 0; i < episodes[e].nationalCuisineIDs.length; i++) {
        episodes[e].nationalCuisineIDs[i] = episodes[e].nationalCuisineIDs[i].ncID
      }


      let excludeCookIDs = []
      if (e === 0) {
        excludeCookIDs = [-1]
      }
      else {
        excludeCookIDs = episodes[e - 1].cookIDs
      }
      for (let i = 0; i < episodes[e].nationalCuisineIDs.length; i++) {

        const [results, fields] = await connection.query(
          `SELECT cookID 
          FROM cookHasNational chn 
          WHERE ncID = ? AND cookID NOT IN ( ? )
          ORDER BY RAND()
          LIMIT 1;`,
          [
            episodes[e].nationalCuisineIDs[i],
            excludeCookIDs
          ]
        );

        let cookID = results[0].cookID;
        episodes[e].cookIDs.push(cookID);
      }


      let excludeRecipeIDs = []
      if (e === 0) {
        excludeRecipeIDs = [-1]
      }
      else {
        excludeRecipeIDs = episodes[e - 1].recipeIDs
      }
      for (let i = 0; i < episodes[e].cookIDs.length; i++) {

        const [results, fields] = await connection.query(
          `SELECT recipeID 
          FROM recipe r  
          WHERE ncID = ? AND recipeID NOT IN ( ? )
          ORDER BY RAND()
          LIMIT 1;`,
          [
            episodes[e].nationalCuisineIDs[i],
            excludeRecipeIDs
          ]
        );

        let recipeID = results[0].recipeID;
        episodes[e].recipeIDs.push(recipeID);
      }


      let excludeJudgeIDs = []
      if (e === 0) {
        excludeJudgeIDs = [-1]
      }
      else {
        excludeJudgeIDs = episodes[e - 1].judgeIDs
      }
      for (let i = 0; i < 3; i++) {

        const [results, fields] = await connection.query(
          `SELECT cookID
          FROM cook  
          WHERE cookID NOT IN ( ? ) AND cookID NOT IN ( ? )
          ORDER BY RAND()
          LIMIT 1;`,
          [
            excludeJudgeIDs,
            episodes[e].cookIDs
          ]
        );

        let judgeID = results[0].cookID;
        episodes[e].judgeIDs.push(judgeID);
      }

      for (let i = 0; i < episodes[e].nationalCuisineIDs.length; i++) {

        const [results, fields] = await connection.query(
          `INSERT INTO epHasCookNatRec (epID, ncID, cookID, recipeID) 
          VALUES(?,?,?,?)`,
          [
            episodes[e].epID,
            episodes[e].nationalCuisineIDs[i],
            episodes[e].cookIDs[i],
            episodes[e].recipeIDs[i]
          ]
        );
      }

      for (let i = 0; i < episodes[e].judgeIDs.length; i++) {

        const [results, fields] = await connection.query(
          `INSERT INTO judge(epID, cookID) VALUES ( ?, ? )`,
          [
            episodes[e].epID,
            episodes[e].judgeIDs[i]
          ]
        );
      }

    }

    res.send('You created a contest successfully!!!');

  } catch (err) {
    console.log(err);
  }
});

// cook can edit his personal info
app.post("/updatecookinfo", async function (req, res) {
  const username = req.session.username;
  const last_name = req.body.last_name;
  const first_name = req.body.first_name;
  const DOB = req.body.DOB;
  const experience = req.body.experience;
  const job = req.body.job;

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    [results, fields] = await connection.query(
      `SELECT cookID 
    FROM user
    WHERE username = ? ;`,
      [
        username
      ]
    );

    // console.log(username);

    const cookID = results[0].cookID;
    if (first_name) {
      [results, fields] = await connection.query(
        `UPDATE cook 
      SET first_name = ?
      WHERE cookID = ? ; `,
        [
          first_name,
          cookID
        ]
      );
    }

    if (last_name) {
      [results, fields] = await connection.query(
        `UPDATE cook 
        SET last_name = ?
        WHERE cookID = ? ; `,
        [
          last_name,
          cookID
        ]
      );
    }

    if (DOB) {
      [results, fields] = await connection.query(
        `UPDATE cook 
      SET DOB = ?
      WHERE cookID = ? ; `,
        [
          DOB,
          cookID
        ]
      );
    }

    if (experience) {
      [results, fields] = await connection.query(
        `UPDATE cook 
        SET experience = ?
        WHERE cookID = ? ; `,
        [
          experience,
          cookID
        ]
      );
    }

    if (job) {
      [results, fields] = await connection.query(
        `UPDATE cook 
        SET job = ?
      WHERE cookID = ? ; `,
        [
          job,
          cookID
        ]
      );
    }

    res.send(results);

  } catch (err) {
    console.log(err);
  }
});

// cook can add his phone 
app.post("/addphone", async function (req, res) {
  const username = req.session.username;
  const phone = req.body.phone;

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    [results, fields] = await connection.query(
      `SELECT cookID 
    FROM user
    WHERE username = ? ;`,
      [
        username
      ]
    );

    // console.log(results[0].cookID);
    const cookID = results[0].cookID;

    [results, fields] = await connection.query(
      `SELECT id, phone
       FROM cook_phone
       WHERE cookID = ? ; `,
      [
        cookID
      ]
    );

    // console.log(results[0].id);
    // console.log(results[0].phone);

    [results, fields] = await connection.query(
      `INSERT INTO cook_phone(cookID, phone) VALUES(?,?)`,
      [
        cookID,
        phone
      ]
    );

    res.send(results);

  } catch (err) {
    console.log(err);
  }
});

// cook can delete his phone 
app.post("/deletephone", async function (req, res) {
  const username = req.session.username;
  const phone = req.body.phone;

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    [results, fields] = await connection.query(
      `SELECT cookID 
      FROM user
      WHERE username = ? ;`,
      [
        username
      ]
    );

    // console.log(results[0].cookID);
    const cookID = results[0].cookID;

    [results, fields] = await connection.query(
      `SELECT id, phone
       FROM cook_phone
       WHERE cookID = ? ; `,
      [
        cookID
      ]
    );

    // console.log(results[0].id);
    // console.log(results[0].phone);

    [results, fields] = await connection.query(
      `DELETE FROM cook_phone 
      WHERE cookID=? AND phone=?;`,
      [
        cookID,
        phone
      ]
    );

    res.send(results);

  } catch (err) {
    console.log(err);
  }
});

// cook can update his phone 
app.post("/updatephone", async function (req, res) {
  const username = req.session.username;
  const oldphone = req.body.oldphone;
  const newphone = req.body.newphone;

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    [results, fields] = await connection.query(
      `SELECT cookID 
      FROM user
      WHERE username = ? ;`,
      [
        username
      ]
    );

    // console.log(results[0].cookID);
    const cookID = results[0].cookID;

    // console.log(results[0].id);
    // console.log(results[0].phone);

    [results, fields] = await connection.query(
      `UPDATE cook_phone 
      SET phone = ?
      WHERE cookID=? AND phone=?;`,
      [
        newphone,
        cookID,
        oldphone
      ]
    );

    res.send(results);

  } catch (err) {
    console.log(err);
  }
});

app.get("/meal", async function (req, res) {

  try {
    const [results, fields] = await connection.query(
      `SELECT *
      FROM meal;`
    );

    // console.log(results);

    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.get("/foodgroups", async function (req, res) {

  try {
    const [results, fields] = await connection.query(
      `SELECT *
      FROM food_group;`
    );

    // console.log(results);

    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.get("/tools", async function (req, res) {

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT *
      FROM tool;`
    );

    // console.log(results);

    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.post("/createtool", async function (req, res) {
  const name = req.body.name;
  const description = req.body.description;

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `INSERT INTO tool(name, description) VALUES
      (?, ?) `,
      [
        name,
        description
      ]
    );
    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.get("/ingredients", async function (req, res) {

  try {
    const [results, fields] = await connection.query(
      `SELECT *
      FROM ingredient;`
    );

    // console.log(results);

    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.post("/createingredient", async function (req, res) {
  const name = req.body.name;
  const food_group = req.body.food_group;
  const caloriesPer100g = req.body.caloriesPer100g;

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `INSERT INTO ingredient (name, food_groupID, caloriesPer100g) VALUES 
      (?, ?, ?) `,
      [
        name,
        food_group,
        caloriesPer100g
      ]
    );
    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.post("/insertimage", async function (req, res) {
  const IMAGE = req.body.IMAGE;
  const description = req.body.description;

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `INSERT INTO image (description, IMAGE) VALUES
      (?, ?) `,
      [
        description,
        IMAGE
      ]
    );
    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.get("/tags", async function (req, res) {

  try {
    const [results, fields] = await connection.query(
      `SELECT *
      FROM tags;`
    );

    // console.log(results);

    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.post("/insertnewtag", async function (req, res) {
  const description = req.body.description;

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `INSERT INTO tags (description) VALUES
      (?) `,
      [
        description
      ]
    );
    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.get("/theme", async function (req, res) {

  try {
    const [results, fields] = await connection.query(
      `SELECT *
      FROM theme;`
    );

    // console.log(results);

    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.post("/insertnewtheme", async function (req, res) {
  const name = req.body.name;
  const description = req.body.description;

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `INSERT INTO theme (name, description) VALUES
      (?, ?) `,
      [
        name,
        description
      ]
    );
    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.post("/createrecipe", async function (req, res) {

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  const name = req.body.name;
  const description = req.body.description;
  const prep_time = req.body.prep_time;
  const cook_time = req.body.cook_time;
  const prtion = req.body.prtion;
  const difficulty = req.body.difficulty;
  const recipe_category = req.body.recipe_category;
  const ingredientID = req.body.ingredientID;
  const ncID = req.body.ncID;
  const imageID = req.body.imageID;
  const toolIDs = req.body.toolIDs;
  const ingredients = req.body.ingredients;
  const fats = req.body.nutrition.fats;
  const carbs = req.body.nutrition.carbs;
  const protein = req.body.nutrition.protein;
  const meal = req.body.meal;
  const tag = req.body.tag;
  const tip = req.body.tip;
  const theme = req.body.theme;
  const process = req.body.process;

  console.log(req.body.nutrition.fats);

  try {
    var [results, fields] = await connection.query(
      `INSERT INTO recipe (name, description, prep_time, cook_time, prtion, difficulty, recipe_category, ingredientID, ncID, imageID) 
    VALUES (?,?,?,?,?,?,?,?,?,?); `,
      [
        name,
        description,
        prep_time,
        cook_time,
        prtion,
        difficulty,
        recipe_category,
        ingredientID,
        ncID,
        imageID,
      ]
    );

    console.log(results);
    const recipeID = results.insertId;

    for (let i = 0; i < toolIDs.length; i++) {
      [results, fields] = await connection.query(
        `INSERT INTO recipeUseTool(recipeID, toolID) VALUES
      (?,?); `,
        [
          recipeID,
          toolIDs[i]
        ]
      );
    }

    for (let i = 0; i < ingredients.length; i++) {
      [results, fields] = await connection.query(
        `INSERT INTO recipeUseIngr (recipeID, ingredientID, quantity, gramsEquivalent) 
      VALUES (?,?,?,?); `,
        [
          recipeID,
          ingredients[i].ID,
          ingredients[i].quantity,
          ingredients[i].grams
        ]
      );
    }

    for (let i = 0; i < meal.length; i++) {
      [results, fields] = await connection.query(
        `INSERT INTO recipeIsMeal(recipeID, mealID)  
        VALUES (?,?); `,
        [
          recipeID,
          meal[i].ID,
        ]
      );
    }

    for (let i = 0; i < tag.length; i++) {
      [results, fields] = await connection.query(
        `INSERT INTO recipeHasTag(recipeID, tagID) 
        VALUES (?,?); `,
        [
          recipeID,
          tag[i].ID,
        ]
      );
    }

    for (let i = 0; i < theme.length; i++) {
      [results, fields] = await connection.query(
        `INSERT INTO recipeIsThemed(recipeID, themeID)
        VALUES (?,?)`,
        [
          recipeID,
          theme[i].ID
        ]
      );
    }

    for (let i = 0; i < tip.length; i++) {
      [results, fields] = await connection.query(
        `INSERT INTO tip (recipeID, description) 
        VALUES (?,?)`,
        [
          recipeID,
          tip[i].description
        ]
      );
    }

    [results, fields] = await connection.query(
      `INSERT INTO step (recipeID, process) VALUES
      (?, ?) `,
      [
        recipeID,
        process
      ]
    );

    [results, fields] = await connection.query(
      `INSERT INTO nutrition (recipeID, fats, carbs, protein) 
      VALUES (?,?,?,?); `,
      [
        recipeID,
        fats,
        carbs,
        protein
      ]
    );

    [results, fields] = await connection.query(
      `UPDATE nutrition n
      SET totalCalories = (SELECT   
          ROUND(SUM( rui.gramsEquivalent * i.caloriesPer100g)/(100*r.prtion), 1) AS totalCalories_inGr
      FROM recipeUseIngr rui 
        JOIN ingredient i ON rui.ingredientID = i.ingredientID 
        JOIN recipe r ON rui.recipeID =r.recipeID 
      WHERE r.recipeID=?)
      WHERE n.recipeID=?; `,
      [
        recipeID,
        recipeID
      ]
    );

    res.send(results);

  } catch (err) {
    console.log(err);
  }
});

app.get("/recipes", async function (req, res) {

  try {
    const [results, fields] = await connection.query(
      `SELECT name
      FROM recipe;`
    );

    // console.log(results);

    res.send(results);
  } catch (err) {
    console.log(err);
  }
});

app.post("/updaterecipe", async function (req, res) {
  const username = req.session.username;

  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  const name = req.body.name;
  const newName = req.body.newName;
  const description = req.body.description;
  const prep_time = req.body.prep_time;
  const cook_time = req.body.cook_time;
  const prtion = req.body.prtion;
  const difficulty = req.body.difficulty;
  const addToolIDs = req.body.addToolIDs;
  const deleteToolIDs = req.body.deleteToolIDs;
  const addIngredient = req.body.addIngredient;
  const deleteIngredient = req.body.deleteIngredient;
  const fats = req.body.fats;
  const carbs = req.body.carbs;
  const protein = req.body.protein;
  const meal = req.body.meal;
  const addTag = req.body.addTag;
  const deleteTag = req.body.deleteTag;
  const tip = req.body.tip;
  // const stepID = req.body.stepID;
  // const addStep = req.body.addStep;
  // const deleteStep = req.body.deleteStep;
  const process = req.body.process;

  try {

    [results, fields] = await connection.query(
      `SELECT cookID 
      FROM user
      WHERE username = ? ;`,
      [
        username
      ]
    );

    // console.log(results);
    const cookID = results[0].cookID;

    [results, fields] = await connection.query(
      `SELECT recipeID
      FROM cook_and_recipes
      WHERE cookID = ? AND name = ?;`,
      [
        cookID,
        name
      ]
    );

    if (results.length == 0) {
      return res.send("You can't edit this recipe :(");
    }

    const recipeID = results[0].recipeID;
    console.log(results.recipeID);

    if (newName) {
      [results, fields] = await connection.query(
        `UPDATE recipe 
      SET name = ? 
      WHERE recipeID= ?; `,
        [
          newName,
          recipeID
        ]
      );
    }

    if (prep_time) {
      [results, fields] = await connection.query(
        `UPDATE recipe 
        SET prep_time = ? 
        WHERE recipeID= ?; `,
        [
          prep_time,
          recipeID
        ]
      );
    }

    if (cook_time) {
      [results, fields] = await connection.query(
        `UPDATE recipe 
        SET cook_time = ? 
        WHERE recipeID= ?; `,
        [
          cook_time,
          recipeID
        ]
      );
    }

    if (prtion) {
      [results, fields] = await connection.query(
        `UPDATE recipe 
        SET prtion = ? 
        WHERE recipeID= ?; `,
        [
          prtion,
          recipeID
        ]
      );
    }

    if (difficulty) {
      [results, fields] = await connection.query(
        `UPDATE recipe 
        SET difficulty = ? 
        WHERE recipeID= ?; `,
        [
          difficulty,
          recipeID
        ]
      );
    }

    if (description) {
      [results, fields] = await connection.query(
        `UPDATE recipe 
        SET description = ? 
        WHERE recipeID= ?; `,
        [
          description,
          recipeID
        ]
      );
    }

    if (addToolIDs) {
      for (let i = 0; i < addToolIDs.length; i++) {
        [results, fields] = await connection.query(
          `INSERT INTO recipeUseTool(recipeID, toolID) VALUES (?,?); `,
          [
            recipeID,
            addToolIDs[i]
          ]
        );
      }
    }

    if (deleteToolIDs) {
      for (let i = 0; i < deleteToolIDs.length; i++) {
        [results, fields] = await connection.query(
          `DELETE FROM recipeUseTool WHERE recipeID= ? AND toolID=?;`,
          [
            recipeID,
            deleteToolIDs[i]
          ]
        );
      }
    }

    if (addIngredient) {
      for (let i = 0; i < addIngredient.length; i++) {
        [results, fields] = await connection.query(
          `INSERT INTO recipeUseIngr (recipeID, ingredientID, quantity, gramsEquivalent) 
          VALUES (?,?,?,?); `,
          [
            recipeID,
            addIngredient[i].ID,
            addIngredient[i].quantity,
            addIngredient[i].grams
          ]
        );
      }
    }

    if (deleteIngredient) {
      for (let i = 0; i < deleteIngredient.length; i++) {
        [results, fields] = await connection.query(
          `DELETE FROM recipeUseIngr WHERE recipeID= ? AND ingredientID=?;`,
          [
            recipeID,
            deleteIngredient[i]
          ]
        );
      }
    }

    if (meal) {
      for (let i = 0; i < meal.length; i++) {
        [results, fields] = await connection.query(
          `INSERT INTO recipeIsMeal(recipeID, mealID)  
          VALUES (?,?); `,
          [
            recipeID,
            meal[i].ID,
          ]
        );
      }
    }

    if (addTag) {
      for (let i = 0; i < addTag.length; i++) {
        [results, fields] = await connection.query(
          `INSERT INTO recipeHasTag(recipeID, tagID) 
          VALUES (?,?); `,
          [
            recipeID,
            addTag[i]
          ]
        );
      }
    }

    if (deleteTag) {
      for (let i = 0; i < deleteTag.length; i++) {
        [results, fields] = await connection.query(
          `DELETE FROM recipeHasTag WHERE recipeID=? AND tagID =? ; `,
          [
            recipeID,
            deleteTag[i]
          ]
        );
      }
    }

    if (tip) {
      for (let i = 0; i < tip.length; i++) {
        [results, fields] = await connection.query(
          `INSERT INTO tip (recipeID, description) 
          VALUES (?,?)`,
          [
            recipeID,
            tip[i].description
          ]
        );
      }
    }

    if (process) {
      [results, fields] = await connection.query(
        `INSERT INTO step (recipeID, process) VALUES
        (?, ?) `,
        [
          recipeID,
          process
        ]
      );
    }

    // if(deleteStep) {
    //   [results, fields] = await connection.query(
    //     `DELETE FROM step WHERE recipeID=? AND stepID= ? `,
    //     [
    //       recipeID,
    //       deleteStep
    //     ]
    //   );
    // }

    if (fats) {
      [results, fields] = await connection.query(
        `UPDATE nutrition 
        SET fats= ?
        WHERE recipeID=?; `,
        [
          fats,
          recipeID
        ]
      );
    }

    if (carbs) {
      [results, fields] = await connection.query(
        `UPDATE nutrition 
        SET carbs= ?
        WHERE recipeID=?; `,
        [
          carbs,
          recipeID
        ]
      );
    }

    if (protein) {
      [results, fields] = await connection.query(
        `UPDATE nutrition 
        SET protein= ?
        WHERE recipeID=?; `,
        [
          protein,
          recipeID
        ]
      );
    }

    if (addIngredient || deleteIngredient) {
      [results, fields] = await connection.query(
        `UPDATE nutrition n
        SET totalCalories = (SELECT   
            ROUND(SUM( rui.gramsEquivalent * i.caloriesPer100g)/(100*r.prtion), 1) AS totalCalories_inGr
        FROM recipeUseIngr rui 
          JOIN ingredient i ON rui.ingredientID = i.ingredientID 
          JOIN recipe r ON rui.recipeID =r.recipeID 
        WHERE r.recipeID=?)
        WHERE n.recipeID=?; `,
        [
          recipeID,
          recipeID
        ]
      );
    }

    res.send(results);

  } catch (err) {
    console.log(err);
  }
});



// QUERIES

app.get("/erotima3.1", async function (req, res) {

  try {
    const [results, fields] = await connection.query(
      `SELECT spcac.cookID, spcac.full_name, description, AVG(score) AS average_score
    FROM score_per_cook_and_cuisine spcac
      JOIN scores s ON spcac.cookID = s.cookID 
    GROUP BY spcac.cookID, description;`
    );

    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.2", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  const year = req.query.year;
  const cuisine = req.query.cuisine;

  if(!year) {
    return res.send('You need to provide year!')
  }
  
  if(!cuisine) {
    return res.send('You need to provide cuisine!')
  }
  
  try {
    const [results, fields] = await connection.query(
      `SELECT * 
      FROM nationalCuisine_year_cook
      WHERE contest_year = ? AND description = ?;`, 
      [
        year, 
        cuisine
      ]
    );
    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.3", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT chn.cookID, CONCAT(first_name, ' ', last_name) AS fullName, chn.ncID, nc.description, r.name 
    FROM cook c
      JOIN cookHasNational chn ON c.cookID = chn.cookID 
      JOIN national_cuisine nc ON chn.ncID = nc.ncID 
      JOIN recipe r ON nc.ncID = r.ncID 
    WHERE age<30
    ORDER BY cookID ;`
    );
    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.4", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT cookID, CONCAT(first_name, ' ', last_name)  AS full_name			
      FROM cook c 
      WHERE c.cookID NOT IN 
      (SELECT cookID FROM judge j);`
    );

    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.5", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT co.contest_year, mt.full_name, co.participation 
      FROM countOfmoreThan3 co 
      JOIN moreThan3 mt ON co.participation = mt.participation
      WHERE co.zeygoi >1;`
    );

    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.6", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT tag1 , tag2, pair_count
      FROM count_of_tagPairs
      LIMIT 3;`
    );

    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.7", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT sc.cookID , CONCAT(first_name, ' ' , last_name) AS full_name
      FROM summetoxi_cook sc
      JOIN cook c ON sc.cookID = c.cookID 
      WHERE summetoxi < ( SELECT MAX(summetoxi) FROM summetoxi_cook sc) - 5 ;`
    );
    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.8", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT emr.epID, emr.contest_year, emr.epNo, SUM(numberOfTools_perRecipe) AS toolCount_perEpisode
    FROM toolCount_perRecipe tcpr
      JOIN episode_match_recipe emr ON tcpr.recipeId= emr.recipeID
    GROUP BY (epID);`
    );
    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.9", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT ROUND(AVG(carbs),2) AS averageCarbs, c.contest_year 
      FROM nutrition n 
      JOIN recipe r ON n.recipeID = r.recipeID 
      JOIN epHasCookNatRec ehcnr ON r.recipeID = ehcnr.recipeID 
      JOIN episode e ON ehcnr.epID = e.epID
      JOIN contest c ON e.contestID = c.contestID  
      GROUP BY c.contestID ;`
    );
    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.10", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT nc.ncID, nc.description,  year1, year2, summetoxi1
      FROM TwoYearParticipation typ JOIN national_cuisine nc ON typ.ncID = nc.ncID 
      WHERE summetoxi1 = summetoxi2
      ORDER BY ncID, year1;` );

    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.11", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  const cookID = req.query.cookID;

  try {
    const [results, fields] = await connection.query(
      `SELECT judge_name, cook_name, sunoliki_bathmologisi
      FROM sum_of_scores_perJudge_andCook
      WHERE cookID = 10 
      ORDER BY sunoliki_bathmologisi DESC
      LIMIT 5;`, 
      [
        cookID
      ]
    );
    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.12", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT contest_year, epNo 
      FROM (SELECT contest_year, epNo, MAX (episodesDifficulty)
          FROM erotima_3_12  e312 
          GROUP BY contest_year) as subquery;
      `
    );
    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.13", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT contest_year, epNo
      FROM (SELECT contest_year, epNo, MIN (profDegree)
          FROM erotima_3_13 
          GROUP BY contest_year) as subquery;`
    );

    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.14", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT name 
      FROM erotima_3_14 
      WHERE timesUsed = 
      (SELECT MAX(timesUsed) 
        FROM erotima_3_14);`
    );

    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});

app.get("/erotima3.15", async function (req, res) {
  if (req.session.loggedin !== true) {
    return res.send("You are not logged in");
  }

  try {
    const [results, fields] = await connection.query(
      `SELECT fg.name 
    FROM food_group fg 
    WHERE food_groupID NOT IN 
      (SELECT fg.food_groupID 
        FROM food_group fg 
          JOIN ingredient i ON fg.food_groupID = i.food_groupID 
          JOIN recipeUseIngr rui ON i.ingredientID = rui.ingredientID 
    GROUP BY fg.name);`
    );

    res.send(results);
  } catch (err) {
    return res.send(err);
  }
});


// Calculation of total calories for the existing recipes
app.get("/totalcal", async function (req, res) {

  try {

    let [results, fields] = await connection.query(
      `SELECT recipeID FROM recipe; `
    );

    const recipeIDs = results;

    for (let i = 0; i < recipeIDs.length; i++) {
      recipeIDs[i] = recipeIDs[i].recipeID
    }

    console.log(recipeIDs);

    for (let i = 0; i < recipeIDs.length; i++) {

      [results, fields] = await connection.query(
        `UPDATE nutrition n
          SET totalCalories = (SELECT   
              ROUND(SUM( rui.gramsEquivalent * i.caloriesPer100g)/(100*r.prtion), 1) AS totalCalories_inGr
          FROM recipeUseIngr rui 
            JOIN ingredient i ON rui.ingredientID = i.ingredientID 
            JOIN recipe r ON rui.recipeID =r.recipeID 
          WHERE r.recipeID=?)
          WHERE n.recipeID=?; `,
        [
          recipeIDs[i],
          recipeIDs[i]
        ]
      );
    }
    res.send(results);

  } catch (err) {
    console.log(err);
  }
});


//  Insertion of random scores
app.get("/runcontest", async function (req, res) {

  try {
    
    [results, fields] = await connection.query(
      `SELECT j.epID, judgeID, ehcnr.cookID, recipeID 
      FROM epHasCookNatRec ehcnr 
      JOIN judge j ON ehcnr.epID = j.epID;`,
    );

    let cookIDs= [];
    let recipeIDs= [];
    let judgeIDs= [];
    let scores=[];


    for (let i = 0; i < results.length; i++) {
      recipeIDs[i] = results[i].recipeID
      judgeIDs[i] = results[i].judgeID
      cookIDs[i] = results[i].cookID
      scores[i]= Math.floor(Math.random() * 5) + 1;
    }

    for (let i = 0; i < scores.length; i++) {

      const [results, fields] = await connection.query(
        `INSERT INTO scores(cookID, recipeID, judgeID, score) 
        VALUES (?,?,?,?);`,
        [
          cookIDs[i],
          recipeIDs[i],
          judgeIDs[i],
          scores[i]
        ]
      );

    }

    res.send('Scores added.');

  } catch (err) {
    console.log(err);
  }
});

app.listen(3000);

console.log("your server is running on port 3000");
