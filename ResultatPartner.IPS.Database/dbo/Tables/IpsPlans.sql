CREATE TABLE [dbo].[IpsPlans] (
    [PlanID]       INT            IDENTITY (1, 1) NOT NULL,
    [PlanType]     INT            NULL,
    [Name]         VARCHAR (50)   NULL,
    [Description]  VARCHAR (1000) NULL,
    [MonthlyPrice] NUMERIC (4, 2) NULL,
    [AnualPrice]   NUMERIC (8, 2) NULL,
    [CreatedDate]  DATETIME       CONSTRAINT [DF_IpsPlans_CreatedDate] DEFAULT (getdate()) NULL,
    [CreatedBy]    INT            NULL,
    [IsDeleted]    BIT            CONSTRAINT [DF_IpsPlans_IsDeleted] DEFAULT ((0)) NULL,
    CONSTRAINT [PK_IpsPlans] PRIMARY KEY CLUSTERED ([PlanID] ASC),
    CONSTRAINT [FK_IpsPlans_LookupItems] FOREIGN KEY ([PlanType]) REFERENCES [dbo].[LookupItems] ([Id])
);

