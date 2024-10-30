CREATE TABLE Users (
	ID SERIAL PRIMARY KEY,
	FirstName VARCHAR(50),
	LastName VARCHAR(50),
	UserName VARCHAR(50),
	Email VARCHAR(50) NOT NULL,
	Password VARCHAR(500),
	Phone CHAR(10),
	Address VARCHAR(500)
);

CREATE TABLE Groups (
	ID SERIAL PRIMARY KEY,
	Name VARCHAR(50),
	DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserGroupXRef (
	UserID INT,
	GroupID INT,
	PRIMARY KEY (UserID, GroupID),
	FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,
	FOREIGN KEY (GroupID) REFERENCES Groups(ID) ON DELETE CASCADE
);

CREATE TABLE Restaurant (
	ID SERIAL PRIMARY KEY,
	Name VARCHAR(100),
	Address VARCHAR(500),
	PriceLevel SMALLINT
);

CREATE TABLE RestaurantHours (
	RestaurantID INT NOT NULL,
	DayOfWeek SMALLINT NOT NULL,
	StartTime TIME NOT NULL,
	EndTime TIME NOT NULL,
	PRIMARY KEY (RestaurantID, DayOfWeek, StartTime, EndTime),
	FOREIGN KEY (RestaurantID) REFERENCES Restaurant(ID) ON DELETE CASCADE
);

CREATE TABLE Selection (
	GroupID INT NOT NULL,
	RestaurantID INT NOT NULL,
	TimeStart TIMESTAMP NOT NULL,
	PRIMARY KEY (GroupID, RestaurantID, TimeStart),
	FOREIGN KEY (RestaurantID) REFERENCES Restaurant(ID) ON DELETE CASCADE,
	FOREIGN KEY (GroupID) REFERENCES Groups(ID) ON DELETE CASCADE
);

CREATE TABLE UserHours (
	UserID INT NOT NULL,
	DayOfWeek SMALLINT NOT NULL,
	StartTime TIME NOT NULL,
	EndTime TIME NOT NULL,
	PRIMARY KEY (UserID, DayOfWeek, StartTime, EndTime),
	FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE
);

CREATE TABLE RestaurantType (
	ID SERIAL PRIMARY KEY,
	Description VARCHAR(50)
);

CREATE TABLE UserRestaurantTypeXRef (
	UserID INT NOT NULL,
	RestaurantTypeID INT NOT NULL,
	FOREIGN KEY (UserID) REFERENCES Users(ID) ON DELETE CASCADE,
	FOREIGN KEY (RestaurantTypeID) REFERENCES RestaurantType(ID) ON DELETE CASCADE
);


-- Insert Dummy Data into Users Table
INSERT INTO Users(
	firstname, lastname, username, password, phone, address, email)
	VALUES ('Armando', 'Toledo', 'mandy1339', 'password', '7864475287', '123 E main St Baltimore MD, 21237', 'atoledo@email.com'),
	 ('Kirby', 'Douglas', 'kdouglas', 'password', '1111111111', '124 E main St Baltimore MD, 21237', 'kdouglas@email.com'),
	 ('Alex', 'Keleher', 'akeleher', 'password', '2222222222', '125 E main St Baltimore MD, 21237', 'akeleher@email.com'),
	 ('Juan', 'Mireles', 'jmireles', 'password', '3333333333', '126 E main St Baltimore MD, 21237', 'jmireles@email.com'),
	 ('Jajuan', 'Myers', 'jmyers', 'password', '4444444444', '127 E main St Baltimore MD, 21237', 'jmyers@email.com'),
	 ('Matt', 'Janak', 'mjanak', 'password', '5555555555', '128 E main St Baltimore MD, 21237', 'mjanak@email.com');

INSERT INTO Groups (name) VALUES 
 ('Group Red'),
 ('The monsters'),
 ('The sharks'),
 ('The workaholics');

 INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'atoledo@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red')),
 ((SELECT id FROM Users WHERE email = 'kdouglas@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red')),
 ((SELECT id FROM Users WHERE email = 'akeleher@email.com'), (SELECT ID FROM Groups WHERE name = 'Group Red'));

INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'jmireles@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters')),
 ((SELECT id FROM Users WHERE email = 'jmyers@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters')),
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'The monsters'));

INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'mjanak@email.com'), (SELECT ID FROM Groups WHERE name = 'The sharks'));

INSERT INTO UserGroupXRef (UserID, GroupID) VALUES
 ((SELECT id FROM Users WHERE email = 'akeleher@email.com'), (SELECT ID FROM Groups WHERE name = 'The workaholics')),
 ((SELECT id FROM Users WHERE email = 'kdouglas@email.com'), (SELECT ID FROM Groups WHERE name = 'The workaholics'));

INSERT INTO Restaurant (Name, Address, PriceLevel) VALUES
('Olive Garden', '8245 Perry Hall Blvd, Baltimore, MD 21236', 2),
('Popeyes', '300 N Broadway, Baltimore, MD 21231', 1),
('McDonald''s', '2501-13 W Franklin St, Baltimore, MD 21223', 1);