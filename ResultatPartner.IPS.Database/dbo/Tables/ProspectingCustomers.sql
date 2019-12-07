CREATE TABLE [dbo].[ProspectingCustomers] (
    [Id]                 INT           IDENTITY (1, 1) NOT NULL,
    [Name]               VARCHAR (50)  NOT NULL,
    [Phone]              VARCHAR (10)  NOT NULL,
    [Detail]             VARCHAR (MAX) NOT NULL,
    [ScheduleDate]       DATETIME      NOT NULL,
    [CreatedOn]          DATETIME      NULL,
    [CreatedBy]          INT           NULL,
    [ModifiedOn]         DATETIME      NULL,
    [ModifiedBy]         INT           NULL,
    [CustomerId]         INT           NULL,
    [ProspectingGoalId]  INT           NULL,
    [CustomerSaleDataId] INT           NULL,
    [AssignedToUserId]   INT           CONSTRAINT [DF_ProspectingCustomers_AssignedToUserId] DEFAULT ((0)) NOT NULL,
    [AssignedOn]         DATETIME      NULL,
    [AssignedBy]         INT           CONSTRAINT [DF_ProspectingCustomers_AssignedBy] DEFAULT ((0)) NOT NULL,
    [UserId]             INT           NULL,
    CONSTRAINT [PK_ProspectingCustomers] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingCustomers_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Customers] ([Id]),
    CONSTRAINT [FK_ProspectingCustomers_CustomerSalesData] FOREIGN KEY ([CustomerSaleDataId]) REFERENCES [dbo].[CustomerSalesData] ([Id]),
    CONSTRAINT [FK_ProspectingCustomers_ProspectingGoalInfo] FOREIGN KEY ([ProspectingGoalId]) REFERENCES [dbo].[ProspectingGoalInfo] ([Id])
);





















