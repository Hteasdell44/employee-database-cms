-- Fill the tables with the data needed initially --
INSERT INTO department
VALUES (1, 'MATH'),
       (2, 'BIOLOGY'),
       (3, 'CHEMISTRY'),
       (4, 'PSYCHOLOGY'),
       (5, 'PHYSICS'),
       (6, 'COMPUTER SCIENCE'),
       (7, 'PHILOSOPHY');
    
INSERT INTO role
VALUES (1, 'WEB DEVELOPER', 900000, 1),
       (2, 'MARKETING SPECIALIST', 75000, 4),
       (3, 'COPYWRITER', 50000, 7),
       (4, 'PRODUCT MANAGER', 100000, 4),
       (5, 'CEO', 1000000, 6);

INSERT INTO employee
VALUES (1, 'Jessica', 'Jones', 2, 7),
       (2, 'Arnold', 'Hayes', 4, 2),
       (3, 'Bryson', 'Donaldson', 5, 1),
       (4, 'Kari', 'Hunt', 3, 4);
           
