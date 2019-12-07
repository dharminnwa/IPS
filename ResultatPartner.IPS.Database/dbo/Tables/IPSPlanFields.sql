CREATE TABLE [dbo].[IPSPlanFields] (
    [IpsPlanLabelID] INT          IDENTITY (1, 1) NOT NULL,
    [PlanTypeID]     INT          NULL,
    [PlanLabelID]    VARCHAR (50) NULL,
    CONSTRAINT [PK_IPSPlanFields] PRIMARY KEY CLUSTERED ([IpsPlanLabelID] ASC)
);

