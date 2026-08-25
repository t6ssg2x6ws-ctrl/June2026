namespace June2026.Domain.Model;

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
