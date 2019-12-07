CREATE TABLE [dbo].[PlanFeaturesKeys] (
    [PlanFeatureID] INT           IDENTITY (1, 1) NOT NULL,
    [Description]   VARCHAR (200) NULL,
    [CategoryID]    INT           NULL,
    [LanguageID]    INT           CONSTRAINT [DF_PlanFeaturesKeys_LanguageID] DEFAULT ((1)) NULL,
    [IsDeleted]     BIT           CONSTRAINT [DF_PlanFeaturesKeys_IsDeleted] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_PlanFeaturesKeys] PRIMARY KEY CLUSTERED ([PlanFeatureID] ASC),
    CONSTRAINT [FK_PlanFeaturesKeys_LookupItems] FOREIGN KEY ([CategoryID]) REFERENCES [dbo].[LookupItems] ([Id]),
    CONSTRAINT [FK_PlanFeaturesKeys_LookupItems1] FOREIGN KEY ([LanguageID]) REFERENCES [dbo].[LookupItems] ([Id])
);

