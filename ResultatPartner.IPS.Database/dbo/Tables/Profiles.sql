CREATE TABLE [dbo].[Profiles] (
    [Id]                            INT            IDENTITY (1, 1) NOT NULL,
    [OrganizationId]                INT            NULL,
    [ProfileTypeId]                 INT            NOT NULL,
    [IndustryId]                    INT            NULL,
    [CategoryId]                    INT            NULL,
    [Name]                          NVARCHAR (100) NOT NULL,
    [Description]                   NVARCHAR (MAX) NULL,
    [MedalRuleId]                   INT            NULL,
    [ScaleId]                       INT            NULL,
    [ScaleSettingsRuleId]           INT            NULL,
    [LevelId]                       INT            NULL,
    [IsActive]                      BIT            CONSTRAINT [DF_Profiles_IsActive] DEFAULT ((0)) NOT NULL,
    [KPIWeak]                       INT            NOT NULL,
    [KPIStrong]                     INT            NOT NULL,
    [IsTemplate]                    BIT            CONSTRAINT [DF_Profiles_IsTemplate] DEFAULT ((0)) NOT NULL,
    [QuestionDisplayRuleId]         INT            NULL,
    [SetKPIInSurvey]                BIT            CONSTRAINT [DF_Profiles_SetKPIInSurvey] DEFAULT ((0)) NOT NULL,
    [RandomizeQuestions]            BIT            NULL,
    [AllowRevisitAnsweredQuestions] BIT            NULL,
    [PassScore]                     INT            NULL,
    [ProjectId]                     INT            NULL,
    [CreatedBy]                     INT            NULL,
    [CreatedOn]                     DATETIME       NULL,
    [ModifiedBy]                    INT            NULL,
    [ModifiedOn]                    DATETIME       NULL,
    [CreatedAsRoleId]               NVARCHAR (128) NULL,
    [ModifiedAsRoleId]              NVARCHAR (128) NULL,
    CONSTRAINT [PK_Profiles] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Profiles_Industries] FOREIGN KEY ([IndustryId]) REFERENCES [dbo].[Industries] ([Id]),
    CONSTRAINT [FK_Profiles_KTMedalRule] FOREIGN KEY ([MedalRuleId]) REFERENCES [dbo].[KTMedalRules] ([Id]),
    CONSTRAINT [FK_Profiles_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_Profiles_ProfileCategories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[ProfileCategories] ([Id]),
    CONSTRAINT [FK_Profiles_ProfileScaleSettingsRules] FOREIGN KEY ([ScaleSettingsRuleId]) REFERENCES [dbo].[ProfileScaleSettingsRules] ([Id]),
    CONSTRAINT [FK_Profiles_ProfileTypes] FOREIGN KEY ([ProfileTypeId]) REFERENCES [dbo].[ProfileTypes] ([Id]),
    CONSTRAINT [FK_Profiles_Projects] FOREIGN KEY ([ProjectId]) REFERENCES [dbo].[Projects] ([Id]),
    CONSTRAINT [FK_Profiles_Scales] FOREIGN KEY ([ScaleId]) REFERENCES [dbo].[Scales] ([Id]),
    CONSTRAINT [FK_Profiles_StructureLevels] FOREIGN KEY ([LevelId]) REFERENCES [dbo].[StructureLevels] ([Id]),
    CONSTRAINT [FK_Profiles_Users] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users] ([Id]),
    CONSTRAINT [FK_Profiles_Users1] FOREIGN KEY ([ModifiedBy]) REFERENCES [dbo].[Users] ([Id])
);








GO
EXECUTE sp_addextendedproperty @name = N'MS_Description', @value = N'For Soft Profiles Only', @level0type = N'SCHEMA', @level0name = N'dbo', @level1type = N'TABLE', @level1name = N'Profiles', @level2type = N'COLUMN', @level2name = N'ScaleId';

