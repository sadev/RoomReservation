using RoomReservation.Domain.Entities;
using RoomReservation.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoomReservation.Domain.Concrete
{
    public class ReservationRepository : IReservationRepository
    {
        EFDbContext context = new EFDbContext();

        public IQueryable<Entities.Event> Events
        {
            get 
            {
                return context.Events;
            }
        }

        public IQueryable<Entities.Room> Rooms
        {
            get
            {
                return context.Rooms;
            }
        }

        public int CreateEvent(Entities.Event entity)
        {
            context.Events.Add(entity);
            context.SaveChanges();

            return entity.ID;
        }

        public void UpdateEvent(Entities.Event entity)
        {
            context.Entry(entity).State = System.Data.Entity.EntityState.Modified;
            context.SaveChanges();
        }

        public void DeleteEvent(Entities.Event entity)
        {
            context.Events.Remove(entity);
            context.SaveChanges();
        }
    }
}
