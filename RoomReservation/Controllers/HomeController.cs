using System.Data;
using RoomReservation.Domain.Concrete;
using RoomReservation.Domain.Entities;
using RoomReservation.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace RoomReservation.Controllers
{
    public class HomeController : Controller
    {
        IReservationRepository repository;

        public HomeController()
        {
            repository = new ReservationRepository();
        }

        public ActionResult Index()
        {
            IEnumerable<Room> rooms = repository.Rooms;

            return View(rooms);
        }

        public ActionResult Scheduler(int id)
        {
            ViewBag.RoomID = id;
            ViewBag.UserName = User.Identity.Name;
            return View();
        }
    }
}