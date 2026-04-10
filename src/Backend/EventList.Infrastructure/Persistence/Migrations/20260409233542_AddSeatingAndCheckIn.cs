using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventList.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSeatingAndCheckIn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ScanCode",
                table: "Invitations",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "CheckedInAtUtc",
                table: "Guests",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE [Invitations]
                SET [ScanCode] = REPLACE(CONVERT(nvarchar(36), NEWID()), '-', '')
                WHERE [ScanCode] IS NULL OR [ScanCode] = '';
                """);

            migrationBuilder.AlterColumn<string>(
                name: "ScanCode",
                table: "Invitations",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(64)",
                oldMaxLength: 64,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invitations_ScanCode",
                table: "Invitations",
                column: "ScanCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Invitations_ScanCode",
                table: "Invitations");

            migrationBuilder.DropColumn(
                name: "ScanCode",
                table: "Invitations");

            migrationBuilder.DropColumn(
                name: "CheckedInAtUtc",
                table: "Guests");
        }
    }
}
