-- [DONE] 3.1. Μέσος Όρος Αξιολογήσεων (σκορ) ανά μάγειρα και Εθνική κουζίνα.
SELECT d.cookID, d.full_name, description, AVG(score) AS average_score
FROM denkseroposnatopo d
JOIN scores s ON d.cookID = s.cookID 
GROUP BY d.cookID, description;

-- [DONE] 3.2. Για δεδομένη Εθνική κουζίνα και έτος, ποιοι μάγειρες ανήκουν σε αυτήν και ποιοι μάγειρες
-- συμμετείχαν σε επεισόδια;
SELECT * 
FROM nationalCuisine_year_cook
WHERE contest_year = 2020 AND description = 'Greek';

-- [DONE] 3.3. Βρείτε τους νέους μάγειρες (ηλικία < 30 ετών) που έχουν τις περισσότερες συνταγές
SELECT chn.cookID, CONCAT(first_name, ' ', last_name) AS fullName, chn.ncID, nc.description, r.name 
FROM cook c
JOIN cookHasNational chn ON c.cookID = chn.cookID 
JOIN national_cuisine nc ON chn.ncID = nc.ncID 
JOIN recipe r ON nc.ncID = r.ncID 
WHERE age<30
ORDER BY cookID ;

-- [DONE] 3.4. Βρείτε τους μάγειρες που δεν έχουν συμμετάσχει ποτέ σε ως κριτές σε κάποιο επεισόδιο.
SELECT cookID, CONCAT(first_name, ' ', last_name)   AS full_name		 			
FROM cook c 
WHERE c.cookID NOT IN 
(SELECT cookID FROM judge j);

-- [DONE] 3.5. Ποιοι κριτές έχουν συμμετάσχει στον ίδιο αριθμό επεισοδίων σε διάστημα ενός έτους με
-- περισσότερες από 3 εμφανίσεις;
SELECT co.contest_year, mt.full_name, co.participation 
FROM countOfmoreThan3 co 
JOIN moreThan3 mt ON co.participation = mt.participation
WHERE co.zeygoi >1;


-- [DONE] 3.6. Πολλές συνταγές καλύπτουν περισσότερες από μια ετικέτες. Ανάμεσα σε ζεύγη πεδίων (π.χ.
-- brunch και κρύο πιάτο) που είναι κοινά στις συνταγές, βρείτε τα 3 κορυφαία (top-3) ζεύγη που
-- εμφανίστηκαν σε επεισόδια. Για το ερώτημα αυτό η απάντηση σας θα πρέπει να περιλαμβάνει
-- εκτός από το ερώτημα (query), εναλλακτικό Query Plan (πχ με force index), τα αντίστοιχα traces
-- και τα συμπεράσματα σας από την μελέτη αυτών.
SELECT tag1 , tag2, pair_count
FROM count_of_tagPairs
LIMIT 3;

-- [DONE] 3.7. Βρείτε όλους τους μάγειρες που συμμετείχαν τουλάχιστον 5 λιγότερες φορές από τον μάγειρα
-- με τις περισσότερες συμμετοχές σε επεισόδια.
SELECT sc.cookID , CONCAT(first_name, ' ' , last_name) AS full_name
FROM summetoxi_cook sc
JOIN cook c ON sc.cookID = c.cookID 
WHERE summetoxi < ( SELECT MAX(summetoxi) FROM summetoxi_cook sc) - 5 ;

-- [DONE] 3.8. Σε ποιο επεισόδιο χρησιμοποιήθηκαν τα περισσότερα εξαρτήματα (εξοπλισμός); Ομοίως με
-- ερώτημα 3.6, η απάντηση σας θα πρέπει να περιλαμβάνει εκτός από το ερώτημα (query),
-- εναλλακτικό Query Plan (πχ με force index), τα αντίστοιχα traces και τα συμπεράσματα σας από
-- την μελέτη αυτών.
SELECT emr.epID, emr.contest_year, emr.epNo, SUM(numberOfTools_perRecipe) AS toolCount_perEpisode
FROM toolCount_perRecipe tcpr
JOIN episode_match_recipe emr ON tcpr.recipeId= emr.recipeID
GROUP BY (epID);

-- [DONE] 3.9. Λίστα με μέσο όρο αριθμού γραμμάριων υδατανθράκων στο διαγωνισμό ανά έτος;
SELECT ROUND(AVG(carbs),2) AS averageCarbs, c.contest_year 
FROM nutrition n 
JOIN recipe r ON n.recipeID = r.recipeID 
JOIN epHasCookNatRec ehcnr ON r.recipeID = ehcnr.recipeID 
JOIN episode e ON ehcnr.epID = e.epID
JOIN contest c ON e.contestID = c.contestID  
GROUP BY c.contestID ;

-- 3.10. Ποιες Εθνικές κουζίνες έχουν τον ίδιο αριθμό συμμετοχών σε διαγωνισμούς, σε διάστημα δύο
-- συνεχόμενων ετών, με τουλάχιστον 3 συμμετοχές ετησίως
SELECT nc.ncID, nc.description,  year1, year2, summetoxi1
FROM TwoYearParticipation typ JOIN national_cuisine nc ON typ.ncID = nc.ncID 
WHERE summetoxi1 = summetoxi2
ORDER BY ncID, year1;

-- [DONE] 3.11. Βρείτε τους top-5 κριτές που έχουν δώσει συνολικά την υψηλότερη βαθμολόγηση σε ένα
-- μάγειρα. (όνομα κριτή, όνομα μάγειρα και συνολικό σκορ βαθμολόγησης)
SELECT judge_name, cook_name, sunoliki_bathmologisi
FROM sum_of_scores_perJudge_andCook
WHERE cookID = 10 
ORDER BY sunoliki_bathmologisi DESC
LIMIT 5;

-- [DONE] 3.12. Ποιο ήταν το πιο τεχνικά δύσκολο, από πλευράς συνταγών, επεισόδιο του διαγωνισμού ανά
-- έτος;
SELECT contest_year, epNo 
FROM (SELECT contest_year, epNo, MAX (episodesDifficulty)
		FROM erotima_3_12  e312 
		GROUP BY contest_year) as subquery;

-- [DONE] 3.13. Ποιο επεισόδιο συγκέντρωσε τον χαμηλότερο βαθμό επαγγελματικής κατάρτισης (κριτές και
-- μάγειρες);
SELECT contest_year, epNo
FROM (SELECT contest_year, epNo, MIN (profDegree)
		FROM erotima_3_13 
		GROUP BY contest_year) as subquery;

-- [DONE] 3.14. Ποια θεματική ενότητα έχει εμφανιστεί τις περισσότερες φορές στο διαγωνισμό;
SELECT name
FROM erotima_3_14
WHERE timesUsed = 
	(SELECT MAX(timesUsed) 
	FROM erotima_3_14);
					
-- [DONE] 3.15. Ποιες ομάδες τροφίμων δεν έχουν εμφανιστεί ποτέ στον διαγωνισμό;
SELECT fg.name 
FROM food_group fg 
WHERE food_groupID NOT IN 
(SELECT fg.food_groupID 
FROM food_group fg 
	JOIN ingredient i ON fg.food_groupID = i.food_groupID
	JOIN recipeUseIngr rui ON i.ingredientID = rui.ingredientID
GROUP BY fg.name);
