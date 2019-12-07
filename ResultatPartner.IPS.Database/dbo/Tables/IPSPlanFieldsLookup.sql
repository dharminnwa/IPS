CREATE TABLE [dbo].[IPSPlanFieldsLookup] (
    [PlanFieldMappingID] INT           IDENTITY (1, 1) NOT NULL,
    [IpsPlanLabelID]     INT           NULL,
    [LabelText]          VARCHAR (200) NULL,
    [LanguageID]         INT           NULL,
    CONSTRAINT [PK_IPSPlanFieldsLookup] PRIMARY KEY CLUSTERED ([PlanFieldMappingID] ASC),
    CONSTRAINT [FK_IPSPlanFieldsLookup_IPSPlanFields] FOREIGN KEY ([IpsPlanLabelID]) REFERENCES [dbo].[IPSPlanFields] ([IpsPlanLabelID]),
    CONSTRAINT [FK_IPSPlanFieldsLookup_LookupItems] FOREIGN KEY ([LanguageID]) REFERENCES [dbo].[LookupItems] ([Id])
);

