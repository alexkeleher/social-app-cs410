CREATE TABLE IF NOT EXISTS Users (
	ID SERIAL PRIMARY KEY,
	FirstName VARCHAR(50),
	LastName VARCHAR(50),
	UserName VARCHAR(50),
	Email VARCHAR(50) NOT NULL,
	Password VARCHAR(500),
	Phone CHAR(10),
	Address VARCHAR(500),
	Latitude VARCHAR(30),
	Longitude VARCHAR(30),
	PreferredPriceRange SMALLINT DEFAULT 1, 	-- Added for price range
    PreferredMaxDistance INT DEFAULT 10,     	-- Added for max distance in miles
	SerializedScheduleMatrix VARCHAR(500)
);

CREATE TABLE Groups (
	ID SERIAL PRIMARY KEY,
	Name VARCHAR(50),
	DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	JoinCode VARCHAR(6) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS UserGroupXRef (
	UserID INT,
	GroupID INT,
	PRIMARY KEY (UserID, GroupID),
	FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,
	FOREIGN KEY (GroupID) REFERENCES Groups(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS GroupInvites (
	ID SERIAL PRIMARY KEY,
	GroupID INT,
	Email VARCHAR(50) NOT NULL,
	InvitedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (GroupID) REFERENCES Groups(ID) ON DELETE CASCADE
);

-- This table is not really used. We can probably get rid of it soon
-- CREATE TABLE Restaurant (
-- 	ID SERIAL PRIMARY KEY,
-- 	Name VARCHAR(100),
-- 	Address VARCHAR(500),
-- 	PriceLevel SMALLINT
-- );

-- Yelp Restaurant table is now just a reference pointer to a yelp business id which we can query with the yelp api
-- e.g. "id": "ewtL3plKywXuLtmFZoUczw",
CREATE TABLE YelpRestaurant (
	YelpID VARCHAR(100) PRIMARY KEY
);

-- Don't need this table anymore
-- CREATE TABLE IF NOT EXISTS RestaurantHours (
-- 	RestaurantID INT NOT NULL,
-- 	DayOfWeek SMALLINT NOT NULL,
-- 	StartTime TIME NOT NULL,
-- 	EndTime TIME NOT NULL,
-- 	PRIMARY KEY (RestaurantID, DayOfWeek, StartTime, EndTime),
-- 	FOREIGN KEY (RestaurantID) REFERENCES YelpRestaurant(InternalRestaurantID) ON DELETE CASCADE
-- );

CREATE TABLE IF NOT EXISTS Selection (
	GroupID INT NOT NULL,
	YelpRestaurantID VARCHAR(100) NOT NULL,
	TimeStart TIMESTAMP NULL,
	DayOfWeek VARCHAR(15) NOT NULL,	-- New field
	Time VARCHAR(10) NOT NULL,		-- New field
	-- PRIMARY KEY (GroupID, YelpRestaurantID, DayOfWeek, Time),
	PRIMARY KEY (GroupID), -- 11/24/2024 - Making this the primary key because we will only allow one event per group now and no archiving.
	FOREIGN KEY (YelpRestaurantID) REFERENCES YelpRestaurant(YelpID) ON DELETE CASCADE,
	FOREIGN KEY (GroupID) REFERENCES Groups(ID) ON DELETE CASCADE
);

-- CREATE TABLE UserHours (
-- 	UserID INT NOT NULL,
-- 	DayOfWeek SMALLINT NOT NULL,
-- 	StartTime TIME NOT NULL,
-- 	EndTime TIME NOT NULL,
-- 	PRIMARY KEY (UserID, DayOfWeek, StartTime, EndTime),
-- 	FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE
-- );

-- CREATE TABLE RestaurantType (
-- 	ID SERIAL PRIMARY KEY,
-- 	Description VARCHAR(50)
-- );

-- CREATE TABLE UserRestaurantTypeXRef (
-- 	UserID INT NOT NULL,
-- 	RestaurantTypeID INT NOT NULL,
-- 	FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,
-- 	FOREIGN KEY (RestaurantTypeID) REFERENCES RestaurantType(ID) ON DELETE CASCADE
-- );


CREATE TABLE IF NOT EXISTS UserCuisinePreferences (
	UserID INT,
	CuisineType VARCHAR(50),
	PRIMARY KEY (UserID, CuisineType),
	FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CuisineTypes (
	ID SERIAL PRIMARY KEY,
	Name VARCHAR(50) UNIQUE,
	Alias VARCHAR(50) UNIQUE
);

CREATE TABLE UserNotification (
	ID SERIAL PRIMARY KEY,
	DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	Message VARCHAR(500),
	IsRead BOOLEAN DEFAULT FALSE,
	UserID INT NOT NULL,
	FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION notify_users_on_selection() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO UserNotification (Message, UserID)
    SELECT 
        'A new social event has been made for your group ' || g.Name || ' on ' || NEW.DayOfWeek || ' at ' || NEW.Time AS Message,
        ug.UserID
    FROM 
        UserGroupXRef ug 	JOIN
		Groups g 			ON g.ID = ug.GroupID
    WHERE 
        ug.GroupID = NEW.GroupID;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER trigger_notify_users
AFTER INSERT ON Selection
FOR EACH ROW
EXECUTE FUNCTION notify_users_on_selection();


-- Inserts into CuisineTypes
INSERT INTO CuisineTypes (Name, Alias) VALUES
('American', 'tradamerican'), ('Italian', 'italian'), ('Mexican', 'mexican'), ('Japanese', 'japanese'), ('Chinese', 'chinese'), ('Indian', 'indpak'),
('Thai', 'thai'), ('Vietnamese', 'vietnamese'), ('Korean', 'korean'), ('French', 'french'), ('Mediterranean', 'mediterranean'), ('Greek', 'greek'),
('Spanish', 'spanish'), ('Middle Eastern', 'mideastern'), ('African', 'african'), ('Caribbean', 'caribbean'), ('German', 'german'),
('British', 'british'), ('Irish', 'irish'); -- Add more as needed (all of these are on Yelp)

-- Inserts into Users
INSERT INTO Users(
	firstname, lastname, username, password, phone, address, email, PreferredPriceRange, PreferredMaxDistance, SerializedScheduleMatrix, Latitude, Longitude)
	VALUES ('Armando', 'Toledo', 'mandy1339', '$2b$10$qrbEWG3zVK9ABohdsvhwNOL8LcO32SeMt9gLIGsNy0XkUnBTSBp1K', '7864475287', '7918 Underhill Rd, Rosedale, MD 21237', 'atoledo@email.com', 2, 5, '0000000000000011000000000000011110000000000000000111111100000000000000000000000011110000000000000000000111111111111111111111111111111', '39.3238724', '-76.5202142'),
	 ('Kirby', 'Douglas', 'kdouglas', '$2b$10$qrbEWG3zVK9ABohdsvhwNOL8LcO32SeMt9gLIGsNy0XkUnBTSBp1K', '1111111111', '2720 Riggs Ave, Baltimore, MD 21216', 'kdouglas@email.com', 1, 7, '0000000011111111111110001111111000000000000000011111111111111111100000000001111111100000000000000111111111111111111111110000000000000', '39.3005628', '-76.66235759999999'),
	 ('Alex', 'Keleher', 'akeleher', '$2b$10$qrbEWG3zVK9ABohdsvhwNOL8LcO32SeMt9gLIGsNy0XkUnBTSBp1K', '2222222222', 'Hanover Woods, 6301 Hanover Crossing Way, Hanover, MD 21076', 'akeleher@email.com', 3, 8, '0000000011111111111111111111111100000000000000011111111111111000000000011111111000000000000011111111111111111110000000000000000000000', '39.1952908', '-76.7226828'),
	 ('Juan', 'Mireles', 'jmireles', '$2b$10$qrbEWG3zVK9ABohdsvhwNOL8LcO32SeMt9gLIGsNy0XkUnBTSBp1K', '3333333333', '50 6 Point Ct, Baltimore, MD 21244', 'jmireles@email.com', 2, 9, '0000001111111111100000000011111110000000000000001111111100000000000000000000000000001111100000000111111111111111111111111110000000000', '39.3465644', '-76.766823'),
	 ('Jajuan', 'Myers', 'jmyers', '$2b$10$qrbEWG3zVK9ABohdsvhwNOL8LcO32SeMt9gLIGsNy0XkUnBTSBp1K', '4444444444', '1423 Lincoln Woods Dr, Catonsville, MD 21228', 'jmyers@email.com', 1, 5, '0000011111111111111111111100000000000111111111000011110111111111111111111110000111111111111111111110000000011000000000000000000000000', '39.3001067', '-76.7618311'),
	 ('Matt', 'Janak', 'mjanak', '$2b$10$qrbEWG3zVK9ABohdsvhwNOL8LcO32SeMt9gLIGsNy0XkUnBTSBp1K', '5555555555', '3801 Howard Park Ave, Baltimore, MD 21207', 'mjanak@email.com', 2, 4, '0000001111111000011111111111111111111000011111111001111110000000111111111110001111111111111000000000000000000000000000000000000000000', '39.3358705', '-76.6960484'),
	 ('Benji', 'Toledo', 'btoledo', '$2b$10$qrbEWG3zVK9ABohdsvhwNOL8LcO32SeMt9gLIGsNy0XkUnBTSBp1K', '5555555555', '3709 Arcadia Ave, Baltimore, MD 21215', 'btoledo@email.com', 2, 4, '0111111111111111111111110000000000000111111111111101100000000000000000000000000000000000000000000000000000000000000000000000000000000', '39.3433444', '-76.67805820000001'),
	 ('Gonzalo', 'Abreu', 'gabreu', '$2b$10$qrbEWG3zVK9ABohdsvhwNOL8LcO32SeMt9gLIGsNy0XkUnBTSBp1K', '5555555555', '103 Witherspoon Rd, Baltimore, MD 21212', 'gabreu@email.com', 2, 4, '0111111111100000011111111111111110000011111111100000111111111111111110000000111111111111111000000000000000000000000000000000000000000', '39.3586161', '-76.6231602'),
	 ('Trucutu', 'Depaquita', 'tdepaquita', '$2b$10$qrbEWG3zVK9ABohdsvhwNOL8LcO32SeMt9gLIGsNy0XkUnBTSBp1K', '5555555555', '3250 Gulfport Dr, Baltimore, MD 21225', 'tdepaquita@email.com', 2, 4, '0000001111111111110000111111111111100000000000000001110000000000000000000000000000000000000000000000000000000000000000000000000000000', '39.2472029', '-76.6182625'),
	 ('Alejandro', 'Reyes', 'areyes', '$2b$10$qrbEWG3zVK9ABohdsvhwNOL8LcO32SeMt9gLIGsNy0XkUnBTSBp1K', '5555555555', '212 Bridgeview Rd, Baltimore, MD 21225', 'areyes@email.com', 2, 4, '0000000000001111111111111111111111111111111111111111111111111111111111111111111110000000000000000000000000000000000000000000000000000', '39.2512029', '-76.6186319');

-- Inserts into Groups
INSERT INTO Groups (name, JoinCode) VALUES
    ('Group Red', 'RED123'),
    ('The monsters', 'MON456'),
    ('The sharks', 'SHK789'),
    ('The workaholics', 'WRK012'),
	('Stressed Boys', 'STR857'),
	('Gargantuan Buildings', 'GAR918'),
	('TeaTime', 'TEA745'),
	('Techy Lunchers', 'TEC874'),
	('Frat Friends', 'FRA897'),
	('Coworkers Forever', 'COW791');

-- Inserts into UserGroupXRef
 INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'atoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red')),
 ((SELECT id FROM Users WHERE email = 'kdouglas@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red')),
 ((SELECT id FROM Users WHERE email = 'akeleher@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red')),
 ((SELECT id FROM Users WHERE email = 'jmireles@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red')),
 ((SELECT id FROM Users WHERE email = 'jmyers@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red')),
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red')),
 ((SELECT id FROM Users WHERE email = 'btoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red')),
 ((SELECT id FROM Users WHERE email = 'gabreu@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red')),
 ((SELECT id FROM Users WHERE email = 'tdepaquita@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red'));

INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'jmireles@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters')),
 ((SELECT id FROM Users WHERE email = 'jmyers@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters')),
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters')),
 ((SELECT id FROM Users WHERE email = 'areyes@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters')),
 ((SELECT id FROM Users WHERE email = 'tdepaquita@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters')),
 ((SELECT id FROM Users WHERE email = 'gabreu@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters')),
 ((SELECT id FROM Users WHERE email = 'btoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters')),
 ((SELECT id FROM Users WHERE email = 'akeleher@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters'));

INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'The sharks')),
 ((SELECT id FROM Users WHERE email = 'areyes@email.com'), (SELECT ID FROM Groups WHERE name = 'The sharks')),
 ((SELECT id FROM Users WHERE email = 'tdepaquita@email.com'), (SELECT ID FROM Groups WHERE name = 'The sharks')),
 ((SELECT id FROM Users WHERE email = 'gabreu@email.com'), (SELECT ID FROM Groups WHERE name = 'The sharks')),
 ((SELECT id FROM Users WHERE email = 'atoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'The sharks')),
 ((SELECT id FROM Users WHERE email = 'kdouglas@email.com'), (SELECT ID FROM Groups WHERE name = 'The sharks')),
 ((SELECT id FROM Users WHERE email = 'akeleher@email.com'), (SELECT ID FROM Groups WHERE name = 'The sharks'));

INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'atoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'The workaholics')),
 ((SELECT id FROM Users WHERE email = 'akeleher@email.com'), (SELECT ID FROM Groups WHERE name = 'The workaholics')),
 ((SELECT id FROM Users WHERE email = 'kdouglas@email.com'), (SELECT ID FROM Groups WHERE name = 'The workaholics')),
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'The workaholics')),
 ((SELECT id FROM Users WHERE email = 'tdepaquita@email.com'), (SELECT ID FROM Groups WHERE name = 'The workaholics')),
 ((SELECT id FROM Users WHERE email = 'gabreu@email.com'), (SELECT ID FROM Groups WHERE name = 'The workaholics'));

 INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'atoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'Stressed Boys')),
 ((SELECT id FROM Users WHERE email = 'akeleher@email.com'), (SELECT ID FROM Groups WHERE name = 'Stressed Boys')),
 ((SELECT id FROM Users WHERE email = 'kdouglas@email.com'), (SELECT ID FROM Groups WHERE name = 'Stressed Boys')),
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'Stressed Boys')),
 ((SELECT id FROM Users WHERE email = 'jmyers@email.com'), (SELECT ID FROM Groups WHERE name = 'Stressed Boys'));
 
 INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'atoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'Gargantuan Buildings')),
 ((SELECT id FROM Users WHERE email = 'akeleher@email.com'), (SELECT ID FROM Groups WHERE name = 'Gargantuan Buildings')),
 ((SELECT id FROM Users WHERE email = 'kdouglas@email.com'), (SELECT ID FROM Groups WHERE name = 'Gargantuan Buildings')),
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'Gargantuan Buildings'));

 INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'atoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'TeaTime')),
 ((SELECT id FROM Users WHERE email = 'akeleher@email.com'), (SELECT ID FROM Groups WHERE name = 'TeaTime')),
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'TeaTime'));

 INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'atoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'Techy Lunchers')),
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'Techy Lunchers'));
 
 INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'atoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'Frat Friends')); 
 
 INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'Coworkers Forever'));
 
-- Inserts into Restaurant
-- INSERT INTO Restaurant (Name, Address, PriceLevel) VALUES
-- ('Olive Garden', '8245 Perry Hall Blvd, Baltimore, MD 21236', 2),
-- ('Popeyes', '300 N Broadway, Baltimore, MD 21231', 1),
-- ('McDonald''s', '2501-13 W Franklin St, Baltimore, MD 21223', 1);

-- Inserts into GroupInvites
INSERT INTO GroupInvites (GroupID, Email) VALUES
(10,'atoledo@email.com'),
(2,'kdouglas@email.com'),
(10,'akeleher@email.com'),
(3,'jmireles@email.com'),
(10,'jmyers@email.com'),
(9,'mjanak@email.com'),
(10,'btoledo@email.com'),
(10,'gabreu@email.com'),
(2,'atoledo@email.com'),
(7,'areyes@email.com');

-- Inserts into UserCuisinePreferences
INSERT INTO UserCuisinePreferences (UserID, CuisineType) VALUES
(1, 'Caribbean'),
(1, 'Italian'),
(1, 'Indian'),
(1, 'Korean'),
(1, 'Mediterranean'),
(1, 'German'),
(2, 'Thai'),
(2, 'Italian'),
(2, 'American'),
(2, 'Japanese'),
(3, 'Chinese'),
(3, 'Indian'),
(3, 'Thai'),
(4, 'Vietnamese'),
(4, 'Korean'),
(5, 'Japanese'),
(5, 'French'),
(5, 'Korean'),
(6, 'Vietnamese'),
(6, 'Thai'),
(6, 'British'),
(6, 'Irish'),
(7, 'Middle Eastern'),
(7, 'Italian'),
(7, 'African'),
(7, 'Chinese'),
(7, 'German'),
(8, 'Middle Eastern'),
(8, 'Italian'),
(8, 'African'),
(8, 'Chinese'),
(9, 'Middle Eastern'),
(9, 'Greek'),
(9, 'Korean'),
(9, 'Italian'),
(10, 'Caribbean'),
(10, 'Greek');

-- Inserts into YelpRestaurant
INSERT INTO YelpRestaurant (YelpID) VALUES 
('ewtL3plKywXuLtmFZoUczw'),
('7G6v_LoHwUi1L0y8z6mlJA');

-- Inserts into Selection (aka SocialEvent)
INSERT INTO Selection (GroupID, YelpRestaurantID, TimeStart, DayOfWeek, Time) VALUES
(1, 'ewtL3plKywXuLtmFZoUczw', NULL, 'Monday', '2:00 PM');

