namespace June2026.Domain.Model;

public class UserDeleteRequestModel
{  
    public int ID {get; set;}
}
public class UserDeleteResponseModel
{  
    public bool isSuccess { get; set; }
    public string message { get; set; }
}