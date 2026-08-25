using System;
using System.Net.Http;
using System.Threading.Tasks;
using ConsoleApp3;
using System.Text;
using Newtonsoft.Json;
using JsonSerializer = System.Text.Json.JsonSerializer;

Start:
Console.WriteLine("----Choose The Number----");
Console.WriteLine("1. Read");
Console.WriteLine("2. Create");
Console.WriteLine("3. Update");
Console.WriteLine("4. Delete");
Console.WriteLine("5. Exit");
Console.WriteLine("Choose : ");
string input = Console.ReadLine();

int convert =  Convert.ToInt32(input);
if (convert == 1)
{
    HttpClient client = new HttpClient();
    HttpResponseMessage response = await client.GetAsync("https://localhost:7063/api/User");
    if (response.IsSuccessStatusCode)
    {
        string content = await response.Content.ReadAsStringAsync();
        var interprectings =  JsonSerializer.Deserialize<List<UserModel>>(content);
        int count = 0;
        foreach (var data in interprectings )
        {
            Console.WriteLine($"{++count} : {data.name}");
        }
    }
    Console.ReadLine(); 
}else if (convert == 2)
{
    Console.WriteLine("Enter Username: ");
    string username = Console.ReadLine()!;
    Console.WriteLine("Enter Password: ");
    string password = Console.ReadLine()!;

    UserCreateRequestModel requestModel = new UserCreateRequestModel
    {
        Username = username,
        Password = password
    };

    string json = JsonConvert.SerializeObject(requestModel);

    HttpClient client = new HttpClient();
    var stringcontent = new StringContent(json, Encoding.UTF8, "application/json");
    HttpResponseMessage response = await client.PostAsync("https://localhost:7063/api/User", stringcontent);
    
    if (response.IsSuccessStatusCode)
    {
        string content = await response.Content.ReadAsStringAsync();
        var responsemodel =  JsonConvert.DeserializeObject<UserCreateResponseModel>(content);
        Console.WriteLine(responsemodel.message);
    }
}else if (convert == 3)
{
    Console.WriteLine("Enter UserID: ");
    string? id = Console.ReadLine();
    
    Console.WriteLine("Enter Username: ");
    string username = Console.ReadLine()!;
    
    Console.WriteLine("Enter Password: ");
    string password = Console.ReadLine()!;

    UserPatchRequestModel requestModel = new UserPatchRequestModel
    {
        Username = username,
        Password = password
    };
   
    string json = JsonConvert.SerializeObject(requestModel);
    HttpClient client = new HttpClient();
    var stringcontent = new StringContent(json, Encoding.UTF8, "application/json");
    HttpResponseMessage response = await client.PatchAsync($"https://localhost:7063/api/User/{id}", stringcontent);

    if (response.IsSuccessStatusCode)
    {
        string content = await response.Content.ReadAsStringAsync(); 
        var responsemodel = JsonConvert.DeserializeObject<UserPatchResponseModel>(content); 
        Console.WriteLine(responsemodel.message);
    }
}else if (convert == 4)
{
    Console.WriteLine("Enter ID that u want to delete : ");
    string adjust =  Console.ReadLine()!;
    int id = Convert.ToInt32(adjust);
    
  
    HttpClient client = new HttpClient();
    HttpResponseMessage response = await client.DeleteAsync($"https://localhost:7063/api/User/{id}");

    if (response.IsSuccessStatusCode)
    {
        string content = await response.Content.ReadAsStringAsync();
        var responsemodel = JsonConvert.DeserializeObject<UserDeleteResponseModel>(content);
        Console.WriteLine(responsemodel.message);
    }
}
else
{
    goto Exit;
}


goto Start;
Exit:
Console.ReadLine();
        