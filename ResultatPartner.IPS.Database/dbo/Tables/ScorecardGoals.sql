CREATE TABLE [dbo].[ScorecardGoals] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Title]          NVARCHAR (100) NOT NULL,
    [Description]    NVARCHAR (MAX) NULL,
    [OrganizationId] INT            NULL,
    [IsActive]       BIT            CONSTRAINT [DF_ScorecardGoals_IsActive] DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_ScorecardGoals] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Organizations_ScorecardGoals] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
);

