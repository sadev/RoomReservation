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
        private readonly EFDbContext _context = new EFDbContext();

        public IQueryable<Entities.Event> Events
        {
            get 
            {
                return _context.Events;
            }
        }

        public IQueryable<Entities.Room> Rooms
        {
            get
            {
                return _context.Rooms;
            }
        }

        public IQueryable<RepeatConfig> RepeatConfigs {
            get
            {
                return _context.RepeatConfigs;
            }
        }

        public int CreateEvent(Entities.Event entity)
        {
            _context.Events.Add(entity);
            _context.SaveChanges();

            return entity.ID;
        }

        public void UpdateEvent(Entities.Event entity)
        {
            _context.Entry(entity).State = System.Data.Entity.EntityState.Modified;
            _context.SaveChanges();
        }

        public void DeleteEvent(Entities.Event entity)
        {
            _context.Events.Remove(entity);
            _context.SaveChanges();
        }

        public int CreateRepeatConfig(RepeatConfig entity)
        {
            _context.RepeatConfigs.Add(entity);
            _context.SaveChanges();

            return entity.ID;
        }

        public void UpdateRepeatConfig(RepeatConfig entity)
        {
            _context.Entry(entity).State = System.Data.Entity.EntityState.Modified;
            _context.SaveChanges();
        }

        public void DeleteRepeatConfig(RepeatConfig entity)
        {
            _context.RepeatConfigs.Remove(entity);
            _context.SaveChanges();
        }
    }
}
