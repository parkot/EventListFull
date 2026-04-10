using EventList.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EventList.Tests.TestInfrastructure;

internal static class TestDbContextFactory
{
    public static ApplicationDbContext Create()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase($"EventListTests_{Guid.NewGuid():N}")
            .Options;

        return new ApplicationDbContext(options);
    }
}