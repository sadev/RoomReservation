using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoomReservation.Domain.Entities
{
    public class RepeatConfig
    {
        public int ID { get; set; }
        public string RepeatType { get; set; }
        public string RepeatEvery { get; set; }
        public string RepeatsOn { get; set; }
        public DateTime RepeatUntil { get; set; }
        public virtual ICollection<Event> Events { get; set; }
    }
}
