
USE RoomReservation

--Inserts Conference rooms
begin transaction

INSERT INTO Rooms ( Title ) VALUES ('Conference room 1')
INSERT INTO Rooms ( Title ) VALUES ('Conference room 2')
INSERT INTO Rooms ( Title ) VALUES ('Conference room 3')

commit transaction