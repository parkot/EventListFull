using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using EventList.Domain.Users;
using EventList.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;

namespace EventList.Tests.Integration;

public sealed class ApiIntegrationTests : IClassFixture<TestApiFactory>
{
    private readonly HttpClient _client;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public ApiIntegrationTests(TestApiFactory factory)
    {
        _client = factory.CreateClient();

        using var scope = factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        if (!dbContext.Users.Any(x => x.Id == TestApiFactory.TestUserId))
        {
            dbContext.Users.Add(new User
            {
                Id = TestApiFactory.TestUserId,
                Email = "test-admin@eventlist.local",
                PasswordHash = "test",
                EmailConfirmed = true,
                Role = AccountRole.Administrator,
                PreferredLanguage = "en"
            });

            dbContext.SaveChanges();
        }
    }

    [Fact]
    public async Task MeEndpoint_ShouldReturnSeededTestUser()
    {
        var meResponse = await _client.GetAsync("/api/users/me");
        meResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var me = await meResponse.Content.ReadFromJsonAsync<UserMeResponse>(JsonOptions);
        me.Should().NotBeNull();
        me!.Email.Should().Be("test-admin@eventlist.local");
    }

    [Fact]
    public async Task EventGuestRsvpFlow_ShouldUpdateEventStats()
    {
        var createdEvent = await PostAsync<CreateEventRequest, EventSummaryResponse>(
            "/api/events",
            new CreateEventRequest(
                "Integration Test Event",
                "Wedding",
                DateTimeOffset.UtcNow.AddDays(30),
                "Integration Hall",
                "42 Integration Ave",
                "UTC",
                "en"));

        var guests = await PostAsync<AddGuestsRequest, List<GuestInvitationResponse>>(
            $"/api/events/{createdEvent.Id}/guests",
            new AddGuestsRequest(new List<CreateGuestRequest>
            {
                new("Guest One", "guest1@test.local", "+3000000001", "en")
            }));

        var invitationCode = guests[0].InvitationCode;

        var rsvpResponse = await _client.PostAsJsonAsync($"/api/invitations/{invitationCode}/rsvp", new SubmitRsvpRequest("Attending"));
        rsvpResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var eventDetails = await GetAsync<EventDetailsResponse>($"/api/events/{createdEvent.Id}");
        eventDetails.Stats.Attending.Should().Be(1);
        eventDetails.Stats.Pending.Should().Be(0);
    }

    [Fact]
    public async Task BillingCheckoutCompletion_ShouldIncreaseSmsCredits()
    {
        var catalog = await _client.GetFromJsonAsync<List<BillingPlanResponse>>("/api/billing/catalog", JsonOptions);
        catalog.Should().NotBeNull();
        var smsPlan = catalog!.Single(x => x.Code == "sms-100");

        var before = await GetAsync<BillingMeResponse>("/api/billing/me");
        before.SmsCreditsBalance.Should().Be(0);

        var checkout = await PostAsync<CreateCheckoutRequest, CheckoutResponse>(
            "/api/billing/checkout",
            new CreateCheckoutRequest(smsPlan.Id));

        var completedResponse = await _client.PostAsJsonAsync("/api/billing/webhooks/vivawallet", new CompleteCheckoutRequest(checkout.ExternalPaymentId));
        completedResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var after = await GetAsync<BillingMeResponse>("/api/billing/me");
        after.SmsCreditsBalance.Should().Be(100);
    }

    private async Task<TResponse> GetAsync<TResponse>(string uri)
    {
        var response = await _client.GetAsync(uri);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var model = await response.Content.ReadFromJsonAsync<TResponse>(JsonOptions);
        model.Should().NotBeNull();
        return model!;
    }

    private async Task<TResponse> PostAsync<TRequest, TResponse>(string uri, TRequest requestModel)
    {
        var response = await _client.PostAsJsonAsync(uri, requestModel);
        response.StatusCode.Should().BeOneOf(HttpStatusCode.OK, HttpStatusCode.Created);

        var model = await response.Content.ReadFromJsonAsync<TResponse>(JsonOptions);
        model.Should().NotBeNull();
        return model!;
    }

    private sealed record UserMeResponse(string Email);

    private sealed record CreateEventRequest(
        string Title,
        string OccasionType,
        DateTimeOffset ScheduledAtUtc,
        string Venue,
        string Address,
        string TimeZone,
        string DefaultLanguage);

    private sealed record EventSummaryResponse(Guid Id);
    private sealed record CreateGuestRequest(string FullName, string Email, string PhoneNumber, string PreferredLanguage);
    private sealed record AddGuestsRequest(List<CreateGuestRequest> Guests);
    private sealed record GuestInvitationResponse(Guid GuestId, string InvitationCode);
    private sealed record SubmitRsvpRequest(string Status);
    private sealed record EventDetailsResponse(EventStatsResponse Stats);
    private sealed record EventStatsResponse(int Pending, int Attending);

    private sealed record BillingPlanResponse(Guid Id, string Code);
    private sealed record BillingMeResponse(int SmsCreditsBalance);
    private sealed record CreateCheckoutRequest(Guid PlanId);
    private sealed record CheckoutResponse(string ExternalPaymentId);
    private sealed record CompleteCheckoutRequest(string ExternalPaymentId);
}