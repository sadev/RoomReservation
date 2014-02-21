using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoomReservation.Domain.Entities
{
    public class Room
    {
        public int ID { get; set; }
        public string Title { get; set; }
        public virtual ICollection<Event> Events { get; set; }
    }
}
