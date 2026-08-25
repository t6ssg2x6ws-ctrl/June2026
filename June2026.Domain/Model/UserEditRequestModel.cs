using System.Reflection.Metadata;
using System.Runtime.CompilerServices;

namespace June2026.Domain.Model;

public class UserEditRequestModel
{  
    public int ID {get; set;}
}
public class UserEditResponeModel
{
    public int StaffId { get; set; }
    public string Name { get; set; } = null!;
    public bool IsSuccess{get;set;}
    public string message {get; set;}
}