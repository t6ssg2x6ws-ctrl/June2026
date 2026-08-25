using System.Data.Common;
using System.Runtime.Serialization;
using System.Security.Cryptography.X509Certificates;
using ClassLibrary1.Models;
using Microsoft.AspNetCore.Mvc;
using June2026.Domain.Features;
using June2026.Domain.Model;

namespace June2026.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _UserService;
        
        public UserController()
        {
            _UserService = new UserService();
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
           
            return Ok(_UserService.GetUsers);
        }
        [HttpGet("edit/{id}")]
        public IActionResult GetUser(int id)
        {
            return Ok(_UserService.GetUser(new UserEditRequestModel{ID = id}));
        }
        [HttpPost]
        public IActionResult CreateUser([FromBody] UserCreateRequestModel requestModel)
        {
           
            return Ok(requestModel);
        }
        [HttpPatch("{id}")]
        public IActionResult PatchUser(int id, [FromBody] UserPatchRequestModel RequestModel)
        {
           
            return Ok(_UserService.PatchUser(new UserPatchRequestModel{id = RequestModel.id,
            Username = RequestModel.Username,
            Password = RequestModel.Password}));
        }
        [HttpDelete("{ID}")]
        public IActionResult DeleteUser([FromRoute]UserDeleteRequestModel RequestModel)
        {
            return Ok(RequestModel);
        }
        
    }

}
