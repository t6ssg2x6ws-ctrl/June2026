namespace ConsoleApp3;

public class UserModel
{
    public int StaffId { get; set; }

    public string name { get; set; } = null!;

    public string password_hash { get; set; } = string.Empty;
}
public class UserCreateRequestModel
{
    public String Username { get; set; }
    public String Password { get; set; }
}

public class UserCreateResponseModel
{
    public bool isSuccess { get; set; }
    public string message { get; set; }
    public int id { get; set; }
}

public class UserPatchRequestModel
{  
    public string? Username { get; set; }
    public string? Password { get; set; }
}
public class UserPatchResponseModel
{
    public bool isSuccess { get; set; }
    public string message { get; set; }
    public int id { get; set; }
}
public class UserDeleteRequestModel
{  
    public int ID {get; set;}
}
public class UserDeleteResponseModel
{  
    public bool isSuccess { get; set; }
    public string message { get; set; }
}