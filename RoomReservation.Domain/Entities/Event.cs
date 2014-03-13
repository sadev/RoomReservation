using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoomReservation.Domain.Entities
{
    public class Event
    {
        public int ID { get; set; }
        public string Title { get; set; }
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public string Person { get; set; }
        public int RoomID { get; set; }
        public int RepeatConfigID { get; set; }
    }
}
