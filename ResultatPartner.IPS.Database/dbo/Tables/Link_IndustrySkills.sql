CREATE TABLE [dbo].[Link_IndustrySkills] (
    [IndustryId] INT NOT NULL,
    [SkillId]    INT NOT NULL,
    CONSTRAINT [PK_Link_IndustrySkills] PRIMARY KEY CLUSTERED ([SkillId] ASC, [IndustryId] ASC),
    CONSTRAINT [FK_IndustrySkills_Industries] FOREIGN KEY ([IndustryId]) REFERENCES [dbo].[Industries] ([Id]),
    CONSTRAINT [FK_IndustrySkills_Skills] FOREIGN KEY ([SkillId]) REFERENCES [dbo].[Skills] ([Id])
);


GO
CREATE NONCLUSTERED INDEX [IX_IndustrySkills]
    ON [dbo].[Link_IndustrySkills]([IndustryId] ASC, [SkillId] ASC);

