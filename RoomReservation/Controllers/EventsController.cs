using RoomReservation.Domain.Concrete;
using RoomReservation.Domain.Entities;
using RoomReservation.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace RoomReservation.Controllers
{
    public class EventsController : ApiController
    {
         IReservationRepository repository;

         public EventsController()
        {
            repository = new ReservationRepository();
        }

        // GET api/event
        public IEnumerable<Event> Get()
        {
            return repository.Events;
        }

        // GET api/event/5
        public Event Get(int id)
        {
            return repository.Events.FirstOrDefault(x => x.ID == id);
        }

        [Route("api/events/room/{id}")]
        public IEnumerable<Event> GetByRoomId(int id)
        {
            return repository.Events.Where(x => x.Room != null && x.Room.ID == id);
        }

        // POST api/event
        public int Post(Event value)
        {
            return repository.CreateEvent(value);
        }

        // PUT api/event/5
        public void Put(int id, Event value)
        {
            repository.UpdateEvent(value);
        }

        // DELETE api/event/5
        public void Delete(int id)
        {
            Event entity = repository.Events.FirstOrDefault(x => x.ID == id);

            if (entity != null)
            {
                repository.DeleteEvent(entity);
            }
        }
    }
}
