using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventList.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SoftDeletePeople : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_People_OwnerUserId_Email",
                table: "People");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ArchivedAtUtc",
                table: "People",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "People",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_People_OwnerUserId_Email",
                table: "People",
                columns: new[] { "OwnerUserId", "Email" },
                unique: true,
                filter: "[IsArchived] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_People_OwnerUserId_Email",
                table: "People");

            migrationBuilder.DropColumn(
                name: "ArchivedAtUtc",
                table: "People");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "People");

            migrationBuilder.CreateIndex(
                name: "IX_People_OwnerUserId_Email",
                table: "People",
                columns: new[] { "OwnerUserId", "Email" },
                unique: true);
        }
    }
}
