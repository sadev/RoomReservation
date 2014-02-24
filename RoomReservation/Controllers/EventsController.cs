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
            return repository.Events.Where(x => x.RoomID == id);
        }

        // POST api/event
        public HttpResponseMessage Post(Event value)
        {
            if (!ModelState.IsValid)
			{
				return Request.CreateResponse(HttpStatusCode.BadRequest);
			}
             
            int eventID = repository.CreateEvent(value);

            return Request.CreateResponse(HttpStatusCode.OK, eventID);
        }

        // PUT api/event/5
        public HttpResponseMessage Put(Event value)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            repository.UpdateEvent(value);

            return Request.CreateResponse(HttpStatusCode.OK);
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
