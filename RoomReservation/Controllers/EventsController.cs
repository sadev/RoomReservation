using System.Globalization;
using Newtonsoft.Json;
using RoomReservation.Domain.Concrete;
using RoomReservation.Domain.Entities;
using RoomReservation.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using RoomReservation.Models;

namespace RoomReservation.Controllers
{
    [Authorize]
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

        [Route("api/events/repeatconfig")]
        [HttpPost]
        public HttpResponseMessage GetRepeatData(RepeatingEvent repeating)
        {
            if (repeating.RepeatingID == -999)
            {
                var config = new RepeatConfig
                {
                    RepeatEvery = repeating.RepeatEvery.ToString(CultureInfo.InvariantCulture),
                    RepeatType = repeating.RepeatType,
                    RepeatUntil = repeating.RepeatUntil,
                    RepeatsOn = repeating.RepeatsOn == null ? null : string.Join(",", repeating.RepeatsOn.ToArray())
                };
                repeating.RepeatingID = repository.CreateRepeatConfig(config);
                CreateRepeatingEvents(repeating);
            }
            else
            {
                var config = new RepeatConfig
                {
                    ID = repeating.RepeatingID,
                    RepeatEvery = repeating.RepeatEvery.ToString(CultureInfo.InvariantCulture),
                    RepeatType = repeating.RepeatType,
                    RepeatUntil = repeating.RepeatUntil,
                    RepeatsOn = repeating.RepeatsOn == null ? null : string.Join(",", repeating.RepeatsOn.ToArray())
                };
                repository.UpdateRepeatConfig(config);
                var events = repository.Events.Where(e => e.RepeatConfigID == config.ID);
                if (events.Any())
                {
                    Event eEvent = events.OrderBy(t => t.DateFrom)
                        .FirstOrDefault();
                    if (eEvent != null) repeating.StartDate = eEvent.DateFrom;
                }
                foreach (Event eEvent in events)
                {
                    repository.DeleteEvent(eEvent);
                }
                CreateRepeatingEvents(repeating);
            }
            return Request.CreateResponse(HttpStatusCode.OK, repeating.RepeatingID);
        }

        [Route("api/events/repeatconfig/{id}")]
        public RepeatConfig GetRepeatConfig(int id)
        {
            return repository.RepeatConfigs.FirstOrDefault(x => x.ID == id);
        }

        [Route("api/events/repeatconfig/{id}")]
        [HttpDelete]
        public void DeleteEvents(int id)
        {
            var events = repository.Events.Where(e => e.RepeatConfigID == id);
            foreach (Event eEvent in events)
            {
                repository.DeleteEvent(eEvent);
            }
            var config = repository.RepeatConfigs.FirstOrDefault(e => e.ID == id);
            repository.DeleteRepeatConfig(config);
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

        private void CreateRepeatingEvents(RepeatingEvent repeating)
        {
            var currentDate = repeating.StartDate.Date;
            switch (repeating.RepeatType)
            {
                case "weekly":
                    while (currentDate <= repeating.RepeatUntil)
                    {
                        for (int i = 0; i <= 6; i++)
                        {

                            if (repeating.RepeatsOn.Contains((int)currentDate.DayOfWeek) && currentDate <= repeating.RepeatUntil)
                            {
                                var newEvent = new Event
                                {
                                    DateFrom = currentDate.Date.AddHours(repeating.StartDate.Hour)
                                        .AddMinutes(repeating.StartDate.Minute),
                                    DateTo = currentDate.Date.AddHours(repeating.EndDate.Hour)
                                        .AddMinutes(repeating.EndDate.Minute),
                                    Title = repeating.Title,
                                    RepeatConfigID = repeating.RepeatingID,
                                    Person = repeating.Person,
                                    RoomID = repeating.RoomId
                                };
                                repository.CreateEvent(newEvent);
                            }
                            if ((int)currentDate.DayOfWeek == 5)
                            {
                                currentDate = currentDate.AddDays(3);
                                break;
                            }
                            currentDate = currentDate.AddDays(1);
                        }
                        //week occurence
                        int occurence = (repeating.RepeatEvery - 1) * 7;
                        currentDate = currentDate.AddDays(occurence);
                        //Set currentDate on Monday.
                        int delta = (DayOfWeek.Monday - currentDate.DayOfWeek - 7) % 7;
                        currentDate = currentDate.AddDays(delta);
                    }
                    break;
                case "daily":
                    while (currentDate <= repeating.RepeatUntil)
                    {
                        var newEvent = new Event
                        {
                            DateFrom = currentDate.Date.AddHours(repeating.StartDate.Hour)
                                .AddMinutes(repeating.StartDate.Minute),
                            DateTo = currentDate.Date.AddHours(repeating.EndDate.Hour)
                                .AddMinutes(repeating.EndDate.Minute),
                            Title = repeating.Title,
                            RepeatConfigID = repeating.RepeatingID,
                            Person = repeating.Person,
                            RoomID = repeating.RoomId
                        };
                        repository.CreateEvent(newEvent);
                        //Add occurence
                        currentDate = currentDate.AddDays(1);
                        //Skip weekends
                        switch ((int)currentDate.DayOfWeek)
                        {
                            case 6:
                                currentDate = currentDate.AddDays(2);
                                break;
                            case 7:
                                currentDate = currentDate.AddDays(1);
                                break;
                        }

                    }
                    break;
            }
        }
    }
}
