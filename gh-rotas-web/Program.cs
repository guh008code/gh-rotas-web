using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient("AuthApi", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AuthApi:BaseUrl"]
        ?? throw new InvalidOperationException("Configure AuthApi:BaseUrl."));
    client.Timeout = TimeSpan.FromSeconds(15);
});
var app = builder.Build();
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
    app.UseHttpsRedirection();
}
app.UseStaticFiles();

// Only these fixed routes are forwarded; the browser cannot choose an upstream URL.
foreach (var (route, method) in new[]
{
    ("cadastro", "POST"), ("login", "POST"), ("perfil", "GET")
})
{
    var path = $"/api/auth/{route}";
    app.MapMethods(path, new[] { method }, async (HttpContext context, IHttpClientFactory clients) =>
    {
        context.Response.Headers.CacheControl = "no-store";
        using var request = new HttpRequestMessage(new HttpMethod(method), path);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        if (method == "POST")
        {
            if (!context.Request.HasJsonContentType())
            {
                context.Response.StatusCode = StatusCodes.Status415UnsupportedMediaType;
                return;
            }
            request.Content = new StreamContent(context.Request.Body);
            request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        }
        if (context.Request.Headers.TryGetValue("Authorization", out var authorization))
            request.Headers.TryAddWithoutValidation("Authorization", authorization.ToString());
        try
        {
            using var response = await clients.CreateClient("AuthApi").SendAsync(request, context.RequestAborted);
            context.Response.StatusCode = (int)response.StatusCode;
            context.Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";
            await response.Content.CopyToAsync(context.Response.Body, context.RequestAborted);
        }
        catch (OperationCanceledException) when (!context.RequestAborted.IsCancellationRequested)
        {
            context.Response.StatusCode = StatusCodes.Status504GatewayTimeout;
            await context.Response.WriteAsJsonAsync(new { message = "A API demorou demais para responder." });
        }
        catch (HttpRequestException)
        {
            context.Response.StatusCode = StatusCodes.Status502BadGateway;
            await context.Response.WriteAsJsonAsync(new { message = "Não foi possível conectar à API." });
        }
    });
}
app.MapFallbackToFile("app/index.html");
app.Run();
