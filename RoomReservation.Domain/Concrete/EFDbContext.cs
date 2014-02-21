using RoomReservation.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoomReservation.Domain.Concrete
{
    public class EFDbContext : DbContext
    {
        public EFDbContext()
            : base("DefaultConnection")
        { }

        public DbSet<Event> Events { get; set; }
        public DbSet<Room> Rooms { get; set; }
    }
}
