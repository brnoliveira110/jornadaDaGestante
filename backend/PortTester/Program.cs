using System;
using System.Net.Sockets;

class Program {
    static void Main() {
        string host = "nreuafhfxnuitpoqexwg.supabase.co";
        int[] ports = { 5432, 6543 };
        
        foreach(var port in ports) {
            try {
                Console.WriteLine($"Testing {host}:{port}...");
                using (var client = new TcpClient()) {
                    var result = client.BeginConnect(host, port, null, null);
                    var success = result.AsyncWaitHandle.WaitOne(TimeSpan.FromSeconds(2));
                    if(success) {
                         Console.WriteLine($"SUCCESS: {host}:{port} is OPEN.");
                    } else {
                         Console.WriteLine($"TIMEOUT: {host}:{port}.");
                    }
                }
            } catch(Exception e) {
                Console.WriteLine($"ERROR: {host}:{port} - {e.Message}");
            }
        }
    }
}
