using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventList.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddEventTemplateLanguage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EventTemplates_Name",
                table: "EventTemplates");

            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "EventTemplates",
                type: "nvarchar(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "en");

            migrationBuilder.Sql(
                """
                UPDATE [EventTemplates]
                SET [Language] =
                    CASE
                        WHEN [Name] LIKE '%(ES)' THEN 'es'
                        WHEN [Name] LIKE '%(EL)' THEN 'el'
                        ELSE 'en'
                    END;
                """);

            migrationBuilder.Sql(
                """
                UPDATE [EventTemplates]
                SET [Name] = REPLACE(REPLACE(REPLACE([Name], ' (EN)', ''), ' (ES)', ''), ' (EL)', '')
                WHERE [Name] LIKE '%(EN)' OR [Name] LIKE '%(ES)' OR [Name] LIKE '%(EL)';
                """);

            migrationBuilder.CreateIndex(
                name: "IX_EventTemplates_Name_Language",
                table: "EventTemplates",
                columns: new[] { "Name", "Language" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EventTemplates_Name_Language",
                table: "EventTemplates");

            migrationBuilder.DropColumn(
                name: "Language",
                table: "EventTemplates");

            migrationBuilder.CreateIndex(
                name: "IX_EventTemplates_Name",
                table: "EventTemplates",
                column: "Name",
                unique: true);
        }
    }
}
