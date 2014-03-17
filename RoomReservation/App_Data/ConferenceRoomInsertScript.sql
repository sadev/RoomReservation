
USE RoomReservation

--Inserts Conference rooms
begin transaction

INSERT INTO Rooms ( Title ) VALUES ('Yellow Room')
INSERT INTO Rooms ( Title ) VALUES ('Big Room')

commit transaction