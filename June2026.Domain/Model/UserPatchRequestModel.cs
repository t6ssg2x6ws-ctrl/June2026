namespace June2026.Domain.Model;

public class UserPatchRequestModel
{  
    public int id { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
}
public class UserPatchResponseModel
{
    public bool isSuccess { get; set; }
    public string message { get; set; }
    
}
