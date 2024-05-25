DROP DATABASE IF EXISTS project27;

CREATE DATABASE project27;
USE project27;

DROP TABLE IF EXISTS contest;
CREATE TABLE contest(
contestID INT NOT NULL AUTO_INCREMENT,
-- season INT NOT NULL,
contest_year INT(4) NOT NULL,
PRIMARY KEY (contestID)
);

DROP TABLE IF EXISTS episode;
CREATE TABLE episode(
epID INT NOT NULL AUTO_INCREMENT,
epNo INT NOT NULL ,
contestID INT NOT NULL,
PRIMARY KEY (epID),
FOREIGN KEY (contestID) REFERENCES contest(contestID)
);

DROP TABLE IF EXISTS image;
CREATE TABLE image(
imageID INT NOT NULL AUTO_INCREMENT,
description VARCHAR(200) NOT NULL,
IMAGE TEXT,
PRIMARY KEY(imageID)
);

DROP TABLE IF EXISTS national_cuisine;
CREATE TABLE national_cuisine(
ncID int NOT NULL AUTO_INCREMENT,
description VARCHAR(300) NOT NULL,
UNIQUE(description),
PRIMARY KEY (ncID)
);

DROP TABLE IF EXISTS meal;
CREATE TABLE meal(
mealID INT NOT NULL AUTO_INCREMENT,
name VARCHAR(40),
UNIQUE (name),
PRIMARY KEY (mealID)
);

DROP TABLE IF EXISTS tags;
CREATE TABLE tags(
tagID INT NOT NULL AUTO_INCREMENT,
description VARCHAR(40),
PRIMARY KEY (tagID)
);

DROP TABLE IF EXISTS theme;
CREATE TABLE theme(
themeID INT NOT NULL AUTO_INCREMENT,
name VARCHAR(80) NOT NULL,
description VARCHAR(300) NOT NULL,
UNIQUE(name),
PRIMARY KEY (themeID)
);

DROP TABLE IF EXISTS food_group;
CREATE TABLE food_group(
food_groupID INT NOT NULL AUTO_INCREMENT,
name VARCHAR(40) NOT NULL,
description LONGTEXT NOT NULL,
PRIMARY KEY (food_groupID)
);

DROP TABLE IF EXISTS tool;
CREATE TABLE tool(
toolID INT NOT NULL AUTO_INCREMENT, 
name VARCHAR(30) NOT NULL UNIQUE,
description VARCHAR(200) NOT NULL,
UNIQUE(name),
PRIMARY KEY (toolID)
);

DROP TABLE IF EXISTS ingredient;
CREATE TABLE ingredient (
ingredientID INT NOT NULL AUTO_INCREMENT,
name VARCHAR(20) NOT NULL unique,
food_groupID INT NOT NULL,
caloriesPer100g INT NOT NULL,
UNIQUE (name),
PRIMARY KEY (ingredientID),
FOREIGN KEY (food_groupID) REFERENCES food_group (food_groupID)
);

DROP TABLE IF EXISTS recipe;
CREATE TABLE recipe(
recipeID INT NOT NULL AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
description VARCHAR(600) NOT NULL,
prep_time VARCHAR(20) NOT NULL,
cook_time VARCHAR(20) NOT NULL, 
prtion INT NOT NULL,
difficulty INT
CHECK (difficulty IN (1, 2, 3, 4, 5)), 
recipe_category VARCHAR(20)
CHECK (recipe_category IN ('Desert Recipe', 'Cooking Recipe')),
ingredientID INT NOT NULL,
ncID INT NOT NULL,
imageID INT NOT NULL,
PRIMARY KEY (recipeID),
FOREIGN KEY (ingredientID) REFERENCES ingredient (ingredientID),
FOREIGN KEY (ncID) REFERENCES national_cuisine (ncID),
FOREIGN KEY (imageID) REFERENCES image(imageID)
);

DROP TABLE IF EXISTS tip;
CREATE TABLE tip(
tipID INT NOT NULL AUTO_INCREMENT,
recipeID INT NOT NULL,
description LONGTEXT,
PRIMARY KEY (tipID),
FOREIGN KEY (recipeID) REFERENCES recipe(recipeID)
);

DROP TABLE IF EXISTS step;
CREATE TABLE step(
stepID INT NOT NULL AUTO_INCREMENT,
recipeID INT NOT NULL,
process LONGTEXT NOT NULL,
FOREIGN KEY (recipeID) REFERENCES recipe(recipeID),
PRIMARY KEY (stepID)
);

DROP TABLE IF EXISTS nutrition;
CREATE TABLE nutrition(
nutrID INT NOT NULL AUTO_INCREMENT,
recipeID INT NOT NULL,
fats FLOAT NOT NULL,
carbs FLOAT NOT NULL,
protein FLOAT NOT NULL,
totalCalories FLOAT,
FOREIGN KEY (recipeID) REFERENCES recipe(recipeID),
PRIMARY KEY (nutrID)
);

DROP TABLE IF EXISTS recipeIsMeal;
CREATE TABLE recipeIsMeal(
ID INT NOT NULL AUTO_INCREMENT,
recipeID INT NOT NULL,
mealID INT NOT NULL,
PRIMARY KEY (ID),
FOREIGN KEY (recipeID) REFERENCES recipe(recipeID),
FOREIGN KEY (mealID) REFERENCES meal (mealID)
);

DROP TABLE IF EXISTS recipeHasTag;
CREATE TABLE recipeHasTag(
ID INT NOT NULL AUTO_INCREMENT,
recipeID INT NOT NULL,
tagID INT NOT NULL,
PRIMARY KEY (ID),
FOREIGN KEY (recipeID) REFERENCES recipe(recipeID),
FOREIGN KEY (tagID) REFERENCES tags (tagID)
);

DROP TABLE IF EXISTS recipeUseTool;
CREATE TABLE recipeUseTool(
ID INT NOT NULL AUTO_INCREMENT,
recipeID INT NOT NULL,
toolID INT NOT NULL,
PRIMARY KEY (ID),
FOREIGN KEY (recipeID) REFERENCES recipe(recipeID),
FOREIGN KEY (toolID) REFERENCES tool (toolID)
);

DROP TABLE IF EXISTS recipeUseIngr;
CREATE TABLE recipeUseIngr(
ID INT NOT NULL AUTO_INCREMENT,
recipeID INT NOT NULL,
ingredientID INT NOT NULL,
quantity VARCHAR(100),
gramsEquivalent DECIMAL(10, 2),
PRIMARY KEY (ID),
FOREIGN KEY (recipeID) REFERENCES recipe(recipeID),
FOREIGN KEY (ingredientID) REFERENCES ingredient (ingredientID)
);

DROP TABLE IF EXISTS recipeIsThemed;
CREATE TABLE recipeIsThemed(
ID INT NOT NULL AUTO_INCREMENT,
recipeID INT NOT NULL,
themeID INT NOT NULL,
PRIMARY KEY (ID),
FOREIGN KEY (recipeID) REFERENCES recipe(recipeID),
FOREIGN KEY (themeID) REFERENCES theme (themeID)
);

DROP TABLE IF EXISTS cook;
CREATE TABLE cook(
cookID INT NOT NULL AUTO_INCREMENT,
first_name VARCHAR(20) NOT NULL,
last_name VARCHAR(20) NOT NULL,
DOB  DATE NOT NULL,
experience INT NOT NULL,
job ENUM ('3rd cook' , '2nd cook' , '1st cook' , 'assistant cook' , 'chef'),
age INT,
PRIMARY KEY (cookID)
);

DROP TABLE IF EXISTS cook_phone;
CREATE TABLE cook_phone(
id INT NOT NULL AUTO_INCREMENT,
cookID INT NOT NULL,
phone VARCHAR(20) NOT NULL UNIQUE,
PRIMARY KEY (id),
FOREIGN KEY (cookID) REFERENCES cook(cookID)
);

DROP TABLE IF EXISTS cookHasNational;
CREATE TABLE cookHasNational(
id INT NOT NULL AUTO_INCREMENT,
cookID INT NOT NULL,
ncID INT NOT NULL,
PRIMARY KEY (id),
FOREIGN KEY (cookID) REFERENCES cook(cookID),
FOREIGN KEY (ncID) REFERENCES national_cuisine (ncID)
);

DROP TABLE IF EXISTS judge;
CREATE TABLE judge(
judgeID INT NOT NULL AUTO_INCREMENT,
epID INT NOT NULL, 
cookID INT NOT NULL,
PRIMARY KEY (judgeID) ,
FOREIGN KEY (epID) REFERENCES episode(epID),
FOREIGN KEY (cookID) REFERENCES cook(cookID)
);


DROP TABLE IF EXISTS scores;
CREATE TABLE scores (
scoreID INT AUTO_INCREMENT,
cookID INT NOT NULL,
recipeID INT NOT NULL,
judgeID INT NOT NULL,
score INT NOT NULL,
PRIMARY KEY (scoreID),
FOREIGN KEY (cookID) REFERENCES cook (cookID),
FOREIGN KEY (recipeID) REFERENCES recipe (recipeID),
FOREIGN KEY (judgeID) REFERENCES judge (judgeID)
);

DROP TABLE IF EXISTS epHasCookNatRec;
CREATE TABLE epHasCookNatRec(
ID INT NOT NULL AUTO_INCREMENT,
epID INT NOT NULL, 
cookID INT NOT NULL,
ncID INT NOT NULL,
recipeID INT NOT NULL,
PRIMARY KEY (ID),
FOREIGN KEY (ncID) REFERENCES national_cuisine(ncID),
FOREIGN KEY (recipeID) REFERENCES recipe(recipeID),
FOREIGN KEY (epID) REFERENCES episode(epID),
FOREIGN KEY (cookID) REFERENCES cook(cookID)
);

DROP TABLE IF EXISTS user;
CREATE TABLE user(
ID INT NOT NULL AUTO_INCREMENT,
username VARCHAR(30) NOT NULL UNIQUE,
password VARCHAR(10) NOT NULL,
userType VARCHAR(20)
CHECK (userType IN ('admin', 'cook')),
cookID INT,
PRIMARY KEY (ID)
);


-- TRIGGERS

-- trigger for age calculation through DOB, after insert on cook
DELIMITER //

CREATE TRIGGER insert_age
BEFORE INSERT ON cook
FOR EACH ROW
BEGIN
    SET NEW.age = TIMESTAMPDIFF(YEAR, NEW.DOB, CURDATE());
END //

DELIMITER ;

-- trigger for updating the age, after updating DOB on cook
DELIMITER //

CREATE TRIGGER update_age_after_update
BEFORE UPDATE ON cook
FOR EACH ROW
BEGIN
    IF OLD.DOB != NEW.DOB THEN
        SET NEW.age = TIMESTAMPDIFF(YEAR, NEW.DOB, CURDATE());
    END IF;
END //

DELIMITER ;

-- trigger to make a constraint of 3 tips or less
DELIMITER //

CREATE TRIGGER 3_tips_or_less
BEFORE INSERT ON tip
FOR EACH ROW
BEGIN
    DECLARE tip_count INT;

    -- Count existing tips for the recipe inserted
    SELECT COUNT(*) INTO tip_count
    FROM tip
    WHERE recipeID = NEW.recipeID;

    -- Check if the count is more than 3, if yes then give ERROR
    IF tip_count >= 3 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'You have reached the maximum number of tips for this recipe';
    END IF;
END //

DELIMITER ;



-- VIEWS
CREATE VIEW cook_and_recipes AS 
SELECT cookID , r.recipeID, name
FROM epHasCookNatRec ehcnr 
JOIN recipe r ON ehcnr.recipeID = r.recipeID  
GROUP BY r.recipeID
ORDER BY cookID ASC;

CREATE VIEW episodeYearSeason AS 
SELECT e.epID, e.epNo, e.contestID, c.contest_year
FROM episode e 
JOIN contest c ON e.contestID = c.contestID;

-- [DONE] 3.1. Μέσος Όρος Αξιολογήσεων (σκορ) ανά μάγειρα και Εθνική κουζίνα.
CREATE VIEW score_per_cook_and_cuisine AS
SELECT chn.cookID, CONCAT(first_name, ' ', last_name) AS full_name, nc.description
FROM cook c
JOIN cookHasNational chn ON c.cookID = chn.cookID 
JOIN national_cuisine nc ON chn.ncID = nc.ncID 
ORDER BY cookID;

-- [DONE] 3.2. Για δεδομένη Εθνική κουζίνα και έτος, ποιοι μάγειρες ανήκουν σε αυτήν και ποιοι μάγειρες
-- συμμετείχαν σε επεισόδια;
CREATE VIEW nationalCuisine_year_cook AS
SELECT eys.contest_year, nc.description, chn.cookID, CONCAT(first_name, ' ', last_name) AS fullName
FROM cook c
JOIN cookHasNational chn ON c.cookID = chn.cookID 
JOIN national_cuisine nc ON chn.ncID = nc.ncID 
JOIN epHasCookNatRec ehcnr ON ehcnr.ncID = nc.ncID 
JOIN  episodeYearSeason eys ON ehcnr.epID = eys.epID
ORDER BY eys.contest_year ASC, nc.description ;

-- [DONE] 3.5. Ποιοι κριτές έχουν συμμετάσχει στον ίδιο αριθμό επεισοδίων σε διάστημα ενός έτους με
-- περισσότερες από 3 εμφανίσεις;
CREATE VIEW judge_andEpisode_info AS
SELECT j.judgeID, j.cookID, e.epID, e.epNo, e.contestID, c.contest_year
FROM judge j 
JOIN episode e  ON j.epID = e.epID
JOIN contest c ON e.contestID =c.contestID ;

CREATE VIEW participation_per_yearAndJudge AS 
SELECT  contest_year, judgeID, cookID, COUNT(epID) AS participation 
FROM judge_andEpisode_info
GROUP BY cookID, contest_year
ORDER BY contest_year, judgeID;

CREATE VIEW countOfmoreThan3 AS 
SELECT contest_year, participation, COUNT(cookID) AS zeygoi
FROM participation_per_yearAndJudge 
WHERE participation >= 3 
GROUP BY contest_year , participation;

CREATE VIEW moreThan3 AS
SELECT p.cookID, CONCAT(first_name, ' ' , last_name) AS full_name, contest_year, participation
FROM participation_per_yearAndJudge p
JOIN cook c ON p.cookID = c.cookID
WHERE participation >= 3;

-- [DONE] 3.6. Πολλές συνταγές καλύπτουν περισσότερες από μια ετικέτες. Ανάμεσα σε ζεύγη πεδίων (π.χ.
-- brunch και κρύο πιάτο) που είναι κοινά στις συνταγές, βρείτε τα 3 κορυφαία (top-3) ζεύγη που
-- εμφανίστηκαν σε επεισόδια.
CREATE VIEW recipes_and_tags AS
SELECT recipeID, rht.tagID, description
FROM recipeHasTag rht 
JOIN tags t ON rht.tagID = t.tagID;

CREATE VIEW count_of_tagPairs AS
SELECT t1.tagID AS tagID1, t1.description AS tag1 , t2.tagID AS tagID2, t2.description AS tag2, COUNT(*) AS pair_count 
FROM recipes_and_tags t1
JOIN recipes_and_tags t2 ON t1.recipeID = t2.recipeID AND t1.tagID < t2.tagID 
JOIN tags t ON t1.tagID = t.tagID 
JOIN tags t3 ON t2.tagID = t3.tagID 
GROUP BY t1.tagID, t2.tagID 
ORDER BY pair_count DESC;

-- [DONE] 3.7. Βρείτε όλους τους μάγειρες που συμμετείχαν τουλάχιστον 5 λιγότερες φορές από τον μάγειρα
-- με τις περισσότερες συμμετοχές σε επεισόδια.

CREATE VIEW summetoxi_cook AS
SELECT cookID, COUNT(cookID) AS summetoxi
FROM epHasCookNatRec ehcnr
GROUP BY cookID ;

-- [DONE] 3.8. Σε ποιο επεισόδιο χρησιμοποιήθηκαν τα περισσότερα εξαρτήματα (εξοπλισμός); Ομοίως με
-- ερώτημα 3.6, η απάντηση σας θα πρέπει να περιλαμβάνει εκτός από το ερώτημα (query),
-- εναλλακτικό Query Plan (πχ με force index), τα αντίστοιχα traces και τα συμπεράσματα σας από
-- την μελέτη αυτών.
CREATE VIEW episode_match_recipe AS
SELECT eys.epID, eys.epNO, eys.contest_year, ehcnr.recipeID, r.name
FROM epHasCookNatRec ehcnr 
JOIN episodeYearSeason eys ON eys.epID = ehcnr.epID 
JOIN recipe r ON ehcnr.recipeID = r.recipeID 
ORDER BY ehcnr.epID;

CREATE VIEW toolCount_perRecipe AS
SELECT r.recipeID,  COUNT(toolID) AS numberOfTools_perRecipe
FROM recipe r 
JOIN recipeUseTool rut ON rut.recipeID =r.recipeID
GROUP BY rut.recipeID 
ORDER BY rut.recipeID;

-- [DONE] 3.10. Ποιες Εθνικές κουζίνες έχουν τον ίδιο αριθμό συμμετοχών σε διαγωνισμούς, σε διάστημα δύο
-- συνεχόμενων ετών, με τουλάχιστον 3 συμμετοχές ετησίως
CREATE VIEW summetoxi_ethnikis_kouzinas AS 
SELECT contest_year, ncID, COUNT(ncID) AS summetoxi
FROM epHasCookNatRec ehcnr
JOIN episode e ON ehcnr.epID = e.epID 
JOIN contest c ON e.contestID = c.contestID 
GROUP BY contest_year, ncID ;

CREATE VIEW pano_apo3_summetoxes AS 
SELECT contest_year, ncID, summetoxi
FROM summetoxi_ethnikis_kouzinas
HAVING summetoxi > 3 
ORDER BY ncID;

CREATE VIEW TwoYearParticipation AS
SELECT  t1.contest_year AS year1,
		t2.contest_year AS year2,
		t1.ncID,
		t1.summetoxi AS summetoxi1,
		t2.summetoxi AS summetoxi2
FROM pano_apo3_summetoxes t1
JOIN pano_apo3_summetoxes t2 ON t1.ncID = t2.ncID
WHERE t2.contest_year = t1.contest_year + 1;

-- [DONE] 3.11. Βρείτε τους top-5 κριτές που έχουν δώσει συνολικά την υψηλότερη βαθμολόγηση σε ένα
-- μάγειρα. (όνομα κριτή, όνομα μάγειρα και συνολικό σκορ βαθμολόγησης)

CREATE VIEW judge_names AS
SELECT judgeID, j.cookID, first_name, last_name
FROM judge j
JOIN cook c ON j.cookID = c.cookID
GROUP BY judgeID;

CREATE VIEW sum_of_scores_perJudge_andCook AS
SELECT CONCAT(jn.first_name, ' ', jn.last_name ) AS judge_name, 
		CONCAT(c.first_name, ' ', c.last_name) AS cook_name, c.cookID,
		SUM(score) AS sunoliki_bathmologisi
FROM scores s
JOIN judge_names jn ON s.judgeID = jn.judgeID
JOIN cook c ON s.cookID = c.cookID
GROUP BY s.judgeID , s.cookID ;

-- [DONE] 3.12. Ποιο ήταν το πιο τεχνικά δύσκολο, από πλευράς συνταγών, επεισόδιο του διαγωνισμού ανά
-- έτος;
CREATE VIEW erotima_3_12 AS
SELECT contest_year, epNo, SUM(r.difficulty) AS episodesDifficulty
FROM epHasCookNatRec ehcnr 
JOIN recipe r ON ehcnr.recipeID = r.recipeID
JOIN episode e ON ehcnr.epID = e.epID
JOIN contest c ON e.contestID = c.contestID
GROUP BY contest_year, epNo;

-- [DONE] 3.13. Ποιο επεισόδιο συγκέντρωσε τον χαμηλότερο βαθμό επαγγελματικής κατάρτισης (κριτές και
-- μάγειρες);
CREATE VIEW cooksProfessionalism AS
SELECT contest_year, e.epNo, ehcnr.epID, SUM(c.job) AS cookProfessionalismDegree
FROM epHasCookNatRec ehcnr 
JOIN cook c ON ehcnr.cookID= c.cookID
JOIN episode e ON ehcnr.epID = e.epID 
JOIN contest c2 ON e.contestID = c2.contestID
GROUP BY contest_year, epNo ; 

CREATE VIEW judgesProfessionalism AS 
SELECT contest_year, e.epNo, j.epID, SUM(c.job) AS judgeProfessionalismDegree
FROM judge j  
JOIN cook c ON j.cookID= c.cookID
JOIN episode e ON j.epID = e.epID 
JOIN contest c2 ON e.contestID = c2.contestID
GROUP BY contest_year, epNo ; 

CREATE VIEW erotima_3_13 AS
SELECT cp.contest_year, cp.epNo, SUM(cookProfessionalismDegree + judgeProfessionalismDegree) AS profDegree
FROM cooksProfessionalism cp
JOIN judgesProfessionalism jp ON cp.epID= jp.epID
GROUP BY contest_year, epNo;

-- [DONE] 3.14. Ποια θεματική ενότητα έχει εμφανιστεί τις περισσότερες φορές στο διαγωνισμό;
CREATE VIEW erotima_3_14 AS
SELECT t.themeID, t.name , COUNT(rit.themeID) AS timesUsed
FROM recipeIsThemed rit JOIN theme t 
ON rit.themeID= t.themeID 
GROUP BY themeID ;
