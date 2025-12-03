Project 27 is a full database design and implementation for a cooking competition platform.
The system manages chefs, recipes, tools, food groups, national cuisines, contests, episodes, judges, scoring, 
and automated contest generation. The project includes a complete MariaDB schema, custom SQL logic, and a Node.js 
backend used to generate contests, assign participants, calculate scores, and manage system data.

---------------------------------------------------------------------------------------------------------------------

## This repository contains:

* Full ER Diagram & Relational Schema
* Complete DDL & DML scripts
* Triggers, Views, and Queries answering course assignment questions
* Node.js logic for contest creation, random assignments, scoring automation
* Instructions for running the system using Docker, MariaDB, DBeaver, and Node.js

---------------------------------------------------------------------------------------------------------------------

## Database Architecture

### ER Diagram

The ER model describes entities such as:

* `recipe`, `ingredient`, `food_group`, `tool`
* `cook`, `judge`, `national_cuisine`
* `contest`, `episode`
* Relationship tables like `recipeUseIngr`, `recipeUseTool`, `recipeHasTag`, `cookHasNational`, etc.

### Relational Schema

The relational schema is optimized to avoid data redundancy.
Certain 1:1 or simple relationships were merged into primary tables; others became junction tables to represent N relationships.
Because **MariaDB does not support multivalued attributes**, fields such as *tips, steps, cook_phone, meals, tags, themes* were moved to separate tables.

---------------------------------------------------------------------------------------------------------------------

## Core Features

### Automatic Contest Generation

A Node.js script:

* Creates a new contest for a given year
* Generates 10 episodes
* Randomly selects 10 national cuisines per episode
* Assigns eligible cooks and recipes
* Ensures no cook/cuisine/recipe repeats more than 3 consecutive episodes
* Selects 3 judges per episode
* Populates the `epHasCookNatRec` and `judge` tables

### Automated Scoring

A second script:

* Retrieves all judge–cook–recipe combinations
* Generates random scores (1–5)
* Inserts them into the `scores` table

### Automatic Calorie Calculation

A dedicated script calculates the total calories per recipe using ingredient data and portions.

---------------------------------------------------------------------------------------------------------------------

## SQL Logic Included

### DDL

Full schema creation for all entities and relationships.

### DML

All tables populated with realistic and extensive test data.

### Views

Includes views for:

* Participation per year
* Judge frequency
* Tag co-occurrence
* Most difficult episodes
* Cuisine participation patterns
* Top judges
* Many more (full list in `/DDLscript.sql`)

### Triggers

1. Dynamic age calculation for cooks
2. Automatic update on DOB change
3. Constraint: maximum 3 tips per recipe

### Queries

Includes solutions to all assignment questions:

* Most-used themes
* Food groups never appearing
* Tag-pair frequency
* Hardest episode per year
* Chefs under 30 with many recipes
* Cooks who’ve never been judges
  …and more.

---------------------------------------------------------------------------------------------------------------------

## Installation & Setup

### Requirements

* **Docker Desktop**
* **Node.js**
* **DBeaver** (or any DB client)

### Steps

1. Pull the MariaDB image in Docker
2. Run a MariaDB container
3. Connect to it through DBeaver
4. Import `DDLscript.sql`
5. Import `DMLscript.sql`
6. Run the server:

   ```
   npm install
   node index.js
   ```
7. Access endpoints through Postman


---------------------------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------------------------------


Το Project 27 αποτελεί μια ολοκληρωμένη σχεδίαση και υλοποίηση βάσης δεδομένων για μια πλατφόρμα διαγωνισμού μαγειρικής.
Το σύστημα διαχειρίζεται μάγειρες, συνταγές, υλικά, εργαλεία, εθνικές κουζίνες, διαγωνισμούς, επεισόδια, κριτές 
και βαθμολογίες, ενώ περιλαμβάνει και backend σε **Node.js** που παράγει αυτόματα επεισόδια, κάνει αναθέσεις και δημιουργεί 
βαθμολογίες.

## Το repository περιλαμβάνει:

* ER Διάγραμμα & Σχεσιακό Σχήμα
* Πλήρη DDL & DML scripts
* Triggers, Views, Queries
* Node.js scripts για αυτόματη δημιουργία διαγωνισμού & βαθμολογιών
* Οδηγίες εγκατάστασης (Docker, MariaDB, DBeaver, Node.js)

---------------------------------------------------------------------------------------------------------------------

## Αρχιτεκτονική Βάσης

### ER Διάγραμμα

Περιγράφει τις οντότητες:

* συνταγές, υλικά, ομάδες τροφίμων, εργαλεία
* μάγειρες, κριτές, εθνικές κουζίνες
* διαγωνισμούς και επεισόδια
  και όλους τους ενδιάμεσους πίνακες σχέσεων.

### Σχεσιακό Διάγραμμα

Έγινε βελτιστοποίηση ώστε να αποφευχθεί η διπλή αποθήκευση.
Χρησιμοποιήθηκαν Foreign Keys για 1:1 σχέσεις και junction tables για N.
Επίσης, λόγω έλλειψης multivalued attributes στη MariaDB, πολλά attributes υλοποιήθηκαν σε ξεχωριστούς πίνακες.

---------------------------------------------------------------------------------------------------------------------

## Λειτουργικότητα

### Αυτόματη Δημιουργία Διαγωνισμού

Η Node.js εφαρμογή:

* Δημιουργεί νέο διαγωνισμό ανά έτος
* Παράγει 10 επεισόδια
* Επιλέγει 10 εθνικές κουζίνες τυχαία
* Αναθέτει μάγειρες και συνταγές
* Τηρεί περιορισμούς (μέχρι 3 συνεχόμενες εμφανίσεις)
* Επιλέγει 3 κριτές
* Συμπληρώνει τους πίνακες `epHasCookNatRec` και `judge`

### Αυτόματη Βαθμολόγηση

Γίνεται λήψη όλων των συνδυασμών και προσθήκη τυχαίων βαθμών (1–5) στον πίνακα `scores`.

### Υπολογισμός Θερμίδων

Με SQL query υπολογίζεται η συνολική θερμιδική αξία κάθε συνταγής.

---------------------------------------------------------------------------------------------------------------------

## SQL Υλοποίηση

### DDL

Πλήρης δημιουργία όλων των πινάκων της βάσης.

### DML

Όλοι οι πίνακες γεμάτοι με ρεαλιστικά δεδομένα.

### Views

Περιλαμβάνονται views για:

* Συμμετοχές ανά έτος
* Κριτές με πολλές εμφανίσεις
* Συνδυασμούς tags
* Δυσκολία επεισοδίων
* Top κριτές
* Συμμετοχές εθνικών κουζινών
  κ.ά.

### Triggers

1. Υπολογισμός ηλικίας πριν το insert
2. Αυτόματη ενημέρωση ηλικίας σε update
3. Έλεγχος για μέγιστο 3 tips ανά συνταγή

### Queries

Απαντήσεις σε όλα τα ερωτήματα της εργασίας:

* πιο συχνή θεματική
* food groups που δεν εμφανίστηκαν
* top-3 ζεύγη tags
* δυσκολότερο επεισόδιο ανά έτος
* μάγειρες με τις λιγότερες συμμετοχές
* μέσος όρος υδατανθράκων ανά έτος
  …και άλλα.

---------------------------------------------------------------------------------------------------------------------

## Οδηγίες Εγκατάστασης

1. **Docker Desktop** → Pull MariaDB image
2. **DBeaver** → Σύνδεση στο container
3. Εισαγωγή **DDLscript.sql**
4. Εισαγωγή **DMLscript.sql**
5. Εκκίνηση Node.js server:

   ```
   npm install
   node index.js
   ```
6. Χρήση της εφαρμογής μέσω Postman
