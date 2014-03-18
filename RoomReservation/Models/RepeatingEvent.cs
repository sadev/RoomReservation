using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace RoomReservation.Models
{
    public class RepeatingEvent
    {
        public int RepeatingID { get; set; }
        public string RepeatType { get; set; }
        public int RepeatEvery { get; set; }
        public List<int> RepeatsOn { get; set; }
        public DateTime RepeatUntil { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Title { get; set; }
        public string Person { get; set; }
        public int RoomId { get; set; }
        public bool DropResizeEvent { get; set; }
        public int DayDiff { get; set; }
    }
}