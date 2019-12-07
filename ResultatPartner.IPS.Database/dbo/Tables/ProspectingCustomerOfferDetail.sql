CREATE TABLE [dbo].[ProspectingCustomerOfferDetail] (
    [Id]                        INT             IDENTITY (1, 1) NOT NULL,
    [ProspectingCustomerId]     INT             NOT NULL,
    [Description]               NVARCHAR (MAX)  NOT NULL,
    [OfferPrice]                NUMERIC (18, 2) NOT NULL,
    [OfferSentTime]             DATETIME        NOT NULL,
    [OfferSentBy]               INT             NOT NULL,
    [OfferFollowUpScheduleDate] DATETIME        NOT NULL,
    CONSTRAINT [PK_ProspectingCustomerOfferDetail] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProspectingCustomerOfferDetail_ProspectingCustomers] FOREIGN KEY ([ProspectingCustomerId]) REFERENCES [dbo].[ProspectingCustomers] ([Id]),
    CONSTRAINT [FK_ProspectingCustomerOfferDetail_Users] FOREIGN KEY ([OfferSentBy]) REFERENCES [dbo].[Users] ([Id])
);

