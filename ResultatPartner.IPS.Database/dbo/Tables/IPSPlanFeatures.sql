CREATE TABLE [dbo].[IPSPlanFeatures] (
    [IpsPlanFeatureID] INT IDENTITY (1, 1) NOT NULL,
    [PlanID]           INT NULL,
    [PlanTypeID]       INT NULL,
    [PlanFieldID]      INT NULL,
    [Value]            INT NULL,
    [IsDeleted]        BIT CONSTRAINT [DF_IPSPlanFeatures_IsDeleted] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_IPSPlanFeatures] PRIMARY KEY CLUSTERED ([IpsPlanFeatureID] ASC),
    CONSTRAINT [FK_IPSPlanFeatures_IPSPlanFields] FOREIGN KEY ([PlanFieldID]) REFERENCES [dbo].[IPSPlanFields] ([IpsPlanLabelID]),
    CONSTRAINT [FK_IPSPlanFeatures_IpsPlans] FOREIGN KEY ([PlanID]) REFERENCES [dbo].[IpsPlans] ([PlanID])
);

