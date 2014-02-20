using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(RoomReservation.Startup))]
namespace RoomReservation
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
