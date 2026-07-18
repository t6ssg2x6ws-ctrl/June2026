using ConsoleApp1;

AdoDotNetService service = new AdoDotNetService();

service.Read();
service.Create();
service.Update();
service.Delete();

Console.ReadLine();

