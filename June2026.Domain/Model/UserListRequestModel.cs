namespace June2026.Domain.Model;

public class UserListRequestModel
{
    
}

public class UserListResponseModel
{
    public bool isSuccess { get; set; }
    public string message { get; set; }
    public List<UserModels>Users{ get; set; }
}

public class UserModels
{
    public int StaffId { get; set; }

    public string Name { get; set; } = null!;

    public string password_hash { get; set; } = string.Empty;
}