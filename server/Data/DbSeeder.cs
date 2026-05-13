using Microsoft.EntityFrameworkCore;
using SmaaJobb.Api.Domain.Entities;

namespace SmaaJobb.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedCategoriesAsync(db);
    }

    private static async Task SeedCategoriesAsync(AppDbContext db)
    {
        if (await db.JobCategories.AnyAsync())
            return;

        var categories = new List<JobCategory>
        {
            new() { Slug = "soppel-og-rydding", Name = "Søppel og rydding",
                Description = "Kaste søppel, sortere avfall, rydde garasje eller bod.",
                MinAge = 13, AdultsOnly = false, DisplayOrder = 10 },

            new() { Slug = "hagearbeid-lett", Name = "Lett hagearbeid",
                Description = "Vanne planter, plukke ugress, raking av løv. Uten motorisert verktøy.",
                MinAge = 13, AdultsOnly = false, DisplayOrder = 20 },

            new() { Slug = "smahandel-aerend", Name = "Småhandel og ærend",
                Description = "Hente post, gå et ærend, småhandel i nærbutikken.",
                MinAge = 13, AdultsOnly = false, DisplayOrder = 30 },

            new() { Slug = "barnepass", Name = "Barnepass",
                Description = "Passe yngre barn i en avgrenset tidsperiode.",
                MinAge = 15, AdultsOnly = false, DisplayOrder = 40 },

            new() { Slug = "dyrepass", Name = "Dyrepass og lufting",
                Description = "Mate, lufte og passe husdyr.",
                MinAge = 13, AdultsOnly = false, DisplayOrder = 50 },

            new() { Slug = "hagearbeid-tyngre", Name = "Hagearbeid (gressklipping etc.)",
                Description = "Klippe plen, hekksaks med hånd, plukke frukt fra stige under 2m.",
                MinAge = 15, AdultsOnly = false, DisplayOrder = 60 },

            new() { Slug = "rengjoring", Name = "Rengjøring",
                Description = "Støvsuging, gulvvask, vinduspuss innendørs.",
                MinAge = 15, AdultsOnly = false, DisplayOrder = 70 },

            new() { Slug = "flytting-lette-loft", Name = "Flytting (lette løft)",
                Description = "Hjelp med flytting av lettere gjenstander (under 15 kg).",
                MinAge = 15, AdultsOnly = false, DisplayOrder = 80 },

            new() { Slug = "snomakking-handmakt", Name = "Snømåking (med håndmakt)",
                Description = "Snømåking med spade, uten snøfreser.",
                MinAge = 15, AdultsOnly = false, DisplayOrder = 90 },

            new() { Slug = "tyngre-loft-bygg", Name = "Tyngre løft og enkle byggeoppgaver",
                Description = "Tunge løft, enkle byggeoppgaver, bruk av elektrisk håndverktøy.",
                MinAge = 18, AdultsOnly = true, DisplayOrder = 100 },

            new() { Slug = "motorisert-utstyr", Name = "Bruk av motorisert utstyr",
                Description = "Gressklipper, motorsag, snøfreser. Krever myndighetsalder.",
                MinAge = 18, AdultsOnly = true, DisplayOrder = 110 },
        };

        db.JobCategories.AddRange(categories);
        await db.SaveChangesAsync();
    }
}
