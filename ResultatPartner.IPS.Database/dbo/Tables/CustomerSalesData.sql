CREATE TABLE [dbo].[CustomerSalesData] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [CustomerId]     INT            NULL,
    [Date]           DATE           NULL,
    [Model]          NVARCHAR (50)  NULL,
    [Type]           NVARCHAR (500) NULL,
    [RegistrationNo] NVARCHAR (50)  NULL,
    [Seller]         NVARCHAR (50)  NULL,
    [Offer]          INT            NULL,
    [CSVFile]        NVARCHAR (50)  NULL,
    [CreatedDate]    DATETIME       NULL,
    [CreatedBy]      INT            NULL,
    CONSTRAINT [PK_CustomerSalesData] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_CustomerSalesData_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Customers] ([Id])
);







