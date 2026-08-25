using ClassLibrary1.Models;
using June2026.Domain.Model;

namespace June2026.Domain.Features;

public class UserService
{
    private readonly AppDbContext _db;

    public UserService()
    {
        _db = new AppDbContext();
    }


    public UserListResponseModel GetUsers(UserListRequestModel RequestModel)
    {
        try
        {
            var lst = _db.Staff.ToList();
            List<UserModels> users = new List<UserModels>();
            foreach (var item in lst)
            {
                UserModels user = new UserModels
                {
                    StaffId = item.StaffId,
                    Name = item.Name
                };
                users.Add(user);
            }

            return new UserListResponseModel
            {
                Users = users,
                IsSuccess = true,
                message = "User Fetched Successfully"
                // Users = lst.Select(x => new UserModels
                // {
                //     StaffId = x.StaffId,
                //     Name = x.Name
                // }.ToList()
            };
        }
            catch (Exception ex)
        {
            return new UserListResponseModel
            {
                IsSuccess = false,
                message = ex.ToString()
            };

        }


    }
    public UserEditResponeModel GetUser(UserEditRequestModel requestModel)
    {
        try
        {
            var Item = _db.Staff.FirstOrDefault(x => x.StaffId == requestModel.ID);
            if (Item is null)
            {
                return new UserEditResponeModel
                {
                    IsSuccess = false,
                    message = "User Doesnt Exit"
                };
            }
            return new UserEditResponeModel
            {
                IsSuccess = true,
                message = "User Fetched Successfully",
                StaffId = Item.StaffId,
                Name = Item.Name
            };
        }
        catch (Exception ex)
        {
            return new UserEditResponeModel
            {
                IsSuccess = false,
                message = ex.ToString(),
                
            };
          
        }
    }
    public UserCreateResponseModel CreateUser( UserCreateRequestModel requestModel)
    {
        Staff user = new Staff
        {
            Name = requestModel.Username,
            password_hash = requestModel.Password
        };
        _db.Staff.Add(user);
        int result = _db.SaveChanges();

        UserCreateResponseModel model = new UserCreateResponseModel
        {
            isSuccess = result > 0,
            message = result > 0 ? " Is scuccess" : " Is not scuccess",
            id = user.StaffId
        };
        return model;
    }
  
    public UserPatchResponseModel PatchUser( UserPatchRequestModel RequestModel)
    {
        var item = _db.Staff.FirstOrDefault(x => x.StaffId == RequestModel.id);
        if (item is null)
        {
            return new UserPatchResponseModel
            {
                message = "User Doesnt Exist"
            };

        }

        if (!string.IsNullOrEmpty(RequestModel.Username))
        {
            item.Name = RequestModel.Username;
        }

        if (!string.IsNullOrEmpty(RequestModel.Password))
        {
            item.password_hash = RequestModel.Password;
        }

        int result = _db.SaveChanges();
        UserPatchResponseModel model = new UserPatchResponseModel
        {
            isSuccess = result > 0,
            message = result > 0 ? " Updating scuccess" : " Updating Is not scuccess",
        };

        return model;
    }
    
    public UserDeleteResponseModel DeleteUser( UserDeleteRequestModel RequestModel)
    {
        var item = _db.Staff.FirstOrDefault(x => x.StaffId == RequestModel.ID);
        if (item is null)
        {
            return new UserDeleteResponseModel
            {
                message = "User Does Not Exist"
            };
        }
        _db.Remove(item);
        int result = _db.SaveChanges();

        UserDeleteResponseModel model = new UserDeleteResponseModel
        {
            isSuccess = result > 0,
            message = result > 0 ? " Deleting scuccess" : " Deleting does not scuccess",
        };
        _db.SaveChanges();
        return model;
    }
}