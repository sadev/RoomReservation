using RoomReservation.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoomReservation.Domain.Interfaces
{
    public interface IReservationRepository
    {
        IQueryable<Event> Events { get; }
        IQueryable<Room> Rooms { get; }

        int CreateEvent(Event entity);
        void UpdateEvent(Event entity);
        void DeleteEvent(Event entity);
    }
}
