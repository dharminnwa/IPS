CREATE TABLE [dbo].[ProspectingCustomerSalesAgreedData] (
    [Id]                          INT             IDENTITY (1, 1) NOT NULL,
    [SalesCategoryId]             INT             NOT NULL,
    [Description]                 NVARCHAR (50)   NOT NULL,
    [Amount]                      DECIMAL (18, 2) NOT NULL,
    [DeliveryDate]                DATETIME        NOT NULL,
    [ProspectingCustomerId]       INT             NOT NULL,
    [ProspectingActivityId]       INT             NOT NULL,
    [ProspectingCustomerResultId] INT             NOT NULL,
    [CreatedOn]                   DATETIME        NOT NULL,
    [CreatedBy]                   INT             NOT NULL,
    [ModifiedOn]                  DATETIME        NULL,
    [ModifiedBy]                  INT             NULL,
    CONSTRAINT [PK_ProspectingCustomerSalesAgreedData] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingCustomerSalesAgreedData_ProspectingCustomerResult] FOREIGN KEY ([ProspectingCustomerResultId]) REFERENCES [dbo].[ProspectingCustomerResult] ([Id])
);



