var schedulerNS = schedulerNS || {};

var urlReferrer = window.location.href.substring(0, window.location.href.indexOf("Home"));

schedulerNS.calendar = (function () {

    var currentEvent = null;

    function setupCalendar() {
        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'agendaWeek,agendaDay'
            },
            //defaultDate: '2014-01-12',
            allDaySlot: false,
            slotDuration: '00:15:00',
            selectable: true,
            selectHelper: true,
            defaultView: 'agendaWeek',
            editable: true,
            axisFormat: 'HH:mm',
            timeFormat: 'H(:mm)',
            weekends: false,
            select: function (start, end) {
                $('#txtTitle').val('');
                currentEvent = {
                    start: start,
                    end: end
                };
                $('#btnDelete').hide();
                $('#btnDeleteAll').hide();
                $('#eventModal').modal('toggle');
                $('#txtTitle').tooltip('disable')
                              .removeClass('input-validation-error');
                resetRepeatingForm();
            },
            eventClick: function (event, element) {
                resetRepeatingForm();
                if (event.editable) {
                    currentEvent = event;
                    if (currentEvent.repeatConfigId !== -999) {
                        $.ajax({
                            type: 'GET',
                            url: urlReferrer + 'api/events/repeatconfig/' + currentEvent.repeatConfigId,
                            dataType: 'json',
                            contentType: 'application/json',
                            success: function (response) {
                                $('#repeatingEventForm').show();
                                $("#cbRepeatingEvent").prop('checked', true);
                                $('#slcRepeat').val(response.RepeatType);
                                if ($('#slcRepeat').val() === 'weekly') {
                                    $('#divDaysOfWeek input[type=checkbox]').each(function () {
                                        var that = this;
                                        var days=response.RepeatsOn.split(',');
                                        for (var i in days) {
                                            if ($(that).val() === days[i]) {
                                                $(that).prop('checked', true);
                                            }
                                        }
                                    });
                                    $('#grpRepeatEvery').show();
                                } else {
                                    $('#divDaysOfWeek').hide();
                                    $('#grpRepeatEvery').hide();
                                }
                                $('#slcRepeatEvery').val(response.RepeatEvery);
                                $("#dtEnds-input").val(moment(response.RepeatUntil).format('MM/DD/YYYY'));
                                //$('#eventModal').modal('toggle');
                            },
                            error: function (xhr, textStatus, errorThrown) {
                                alert('Error, could not save event!');
                            }
                        });
                        $('#btnDeleteAll').show();
                        $('#btnDelete').show();
                    } else {
                        $('#btnDelete').show();
                        $('#btnDeleteAll').hide();
                    }
                   
                    $('#eventModal').modal('toggle');
                    $('#txtTitle').val(event.title)
                                  .tooltip('disable')
                                  .removeClass('input-validation-error');
                }
            },
            eventDrop: function (event, revertFunc) {
                updateEvent(event.start, event.end, event.id, event.title);
            },
            eventResize: function (event, revertFunc) {
                updateEvent(event.start, event.end, event.id, event.title);
            },

            events: function (start, end, timezone, callback) {
                $.ajax({
                    type: 'GET',
                    url: urlReferrer + 'api/events/room/' + $('#hdnRoomId').val(),
                    dataType: 'json',
                    contentType: 'application/json',
                    data: {
                        start: start.format(),
                        end: end.format()
                    },
                    success: function (data) {
                        var events = [];
                        $.each(data, function (key, value) {
                            if ($('#hdnUserName').val() === value.Person) {
                                events.push({
                                    id: value.ID,
                                    title: value.Title,
                                    start: value.DateFrom,
                                    end: value.DateTo,
                                    editable: true,
                                    person: value.Person,
                                    repeatConfigId: value.RepeatConfigID
                                });
                            } else {
                                events.push({
                                    id: value.ID,
                                    title: value.Title,
                                    start: value.DateFrom,
                                    end: value.DateTo,
                                    editable: false,
                                    color: '#B5B8B8',
                                    textColor: '#000000',
                                    person: value.Person,
                                    repeatConfigId: value.RepeatConfigID
                                });
                            }

                        });
                        callback(events);
                    }
                });
            },
            eventRender: function (event, element) {
                $('.popover').remove();
            },

            eventAfterRender: function (event, element, view) {
                element.popover({
                    container: "body",
                    html: true,
                    trigger: 'hover',
                    title: 'Reservation',
                    placement: 'right',
                    content: '<b>Title:</b> ' + event.title + '<br /><b>Start:</b> ' + event.start.format('HH:mm') + '<br /><b>End:</b> ' + event.end.format('HH:mm') + '<br /><b>Creator:</b> ' + event.person,
                });
            }
        });

        function resetRepeatingForm() {
            $("#cbRepeatingEvent").prop('checked', false);
            $('#slcRepeat').val('weekly');
            $('#divDaysOfWeek').show();
            $('#slcRepeatEvery').val('1');
            $("#dtEnds-input").val(moment().add('months', 1).format('MM/DD/YYYY'));
            $('#divDaysOfWeek input:checked').each(function () {
                $(this).prop('checked', false);
            });
            $('#repeatingEventForm').hide();
            $('#grpRepeatEvery').show();
        }

        $('#btnSave').on('click', function () {
            if ($('#txtTitle').val()) {
                if (!$('#cbRepeatingEvent').is(":checked")) {
                    if (!currentEvent.id) {
                        var newEvent = {
                            'Title': $('#txtTitle').val(),
                            'DateFrom': currentEvent.start.format(),
                            'DateTo': currentEvent.end.format(),
                            'Person': $('#hdnUserName').val(),
                            'RoomID': $('#hdnRoomId').val(),
                            'RepeatConfigID': '-999'
                        };
                        $.ajax({
                            type: 'POST',
                            url: urlReferrer + "api/events",
                            data: newEvent,
                            success: function (response) {
                                $('#calendar').fullCalendar('refetchEvents');
                            },
                            error: function (xhr, textStatus, errorThrown) {
                                alert('Error, could not save event!');
                            }
                        });
                    } else {
                        updateEvent(currentEvent.start, currentEvent.end, currentEvent.id);
                    }
                } else {
                    var repeatsOn=[];
                    $('#divDaysOfWeek input:checked').each(function () {
                         repeatsOn.push($(this).val());
                    });
                    if ($('#slcRepeat').val() === 'weekly' && $('#divDaysOfWeek input:checked').length < 1) {
                             //Business rule, needs to be handled
                    }
                    var result = {
                        RepeatingID: currentEvent.id ? currentEvent.repeatConfigId : '-999',
                        RepeatType: $('#slcRepeat').val(),
                        RepeatEvery: $('#slcRepeatEvery').val(),
                        RepeatsOn: repeatsOn,
                        RepeatUntil: $("#dtEnds-input").val(),
                        StartDate: currentEvent.start.format('MM/DD/YYYY HH:mm'),
                        EndDate: currentEvent.end.format('HH:mm'),
                        Title: $('#txtTitle').val(),
                        Person: $('#hdnUserName').val(),
                        RoomId: $('#hdnRoomId').val()
                    };
                    $.ajax({
                        type: 'POST',
                        url: urlReferrer + 'api/events/repeatconfig',
                        //dataType: 'json',
                        contentType: 'application/json',
                        data: JSON.stringify(result),
                        success: function (response) {
                            $('#calendar').fullCalendar('refetchEvents');
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            alert('Error, could not save events!');
                        }
                    });
        
                }
                $('#eventModal').modal('toggle');
            } else {
                $('#txtTitle').tooltip('destroy')
                  .attr('title', 'Please enter event title')
                  .addClass('input-validation-error')
                  .tooltip('show');
            }
        });

        $('#txtTitle').keypress(function () {
            $(this).tooltip('disable')
                   .removeClass('input-validation-error');
        });

        function updateEvent(start, end, eventId, title) {
            var event = {
                'Title': title ? title : $('#txtTitle').val(),
                'DateFrom': start.format(),
                'DateTo': end.format(),
                'ID': eventId,
                'Person': $('#hdnUserName').val(),
                'RoomID': $('#hdnRoomId').val(),
                'RepeatConfigID': '-999'
            };

            $.ajax({
                type: 'PUT',
                url: urlReferrer + 'api/events/' + $('#hdnRoomId').val(),
                data: event,
                success: function () {
                    $('#calendar').fullCalendar('refetchEvents');
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert('Error, could not save event!');
                }
            });
        }

        $('#btnDelete').on('click', function () {
            if (currentEvent.id) {
                $.ajax({
                    type: 'DELETE',
                    url: urlReferrer + 'api/events/' + currentEvent.id,
                    success: function () {
                        $('#calendar').fullCalendar('removeEvents', currentEvent.id);
                        $('#calendar').fullCalendar('rerenderEvents');
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        alert('Error, could not delete event!');
                    }
                });
            }
            $('#eventModal').modal('toggle');
           // $('#confimationModal').modal('toggle');
        });

        $('#btnDeleteAll').on('click', function () {
            if (currentEvent.id) {
                $.ajax({
                    type: 'DELETE',
                    url: urlReferrer + 'api/events/repeatconfig/' + currentEvent.repeatConfigId,
                    success: function () {
                        $('#calendar').fullCalendar('refetchEvents');
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        alert('Error, could not delete event!');
                    }
                });
            }
            $('#eventModal').modal('toggle');
            // $('#confimationModal').modal('toggle');
        });

        //$('#btnYes').on('click', function () {
        //    if (currentEvent.id) {
        //        $.ajax({
        //            type: 'DELETE',
        //            url: urlReferrer + 'api/events/' + currentEvent.id,
        //            success: function () {
        //                $('#calendar').fullCalendar('removeEvents', currentEvent.id);
        //                $('#calendar').fullCalendar('rerenderEvents');
        //            },
        //            error: function (xhr, textStatus, errorThrown) {
        //                alert('Error, could not delete event!');
        //            }
        //        });
        //    }
        //});

        $("#cbRepeatingEvent").change(function () {
            if (this.checked) {
                $('#repeatingEventForm').show();
                var day = moment(currentEvent.start).day();
                $('#divDaysOfWeek input[type=checkbox]').each(function () {
                    if ($(this).val() === day.toString()) {
                        $(this).prop('checked', true);
                    }
                    
                });
            } else {
                $('#repeatingEventForm').hide();
            }
        });

        $('#slcRepeat').on('change', function () {
            if (this.value === 'weekly') {
                $('#divDaysOfWeek').show();
                $('#grpRepeatEvery').show();
            } else {
                $('#divDaysOfWeek').hide();
                $('#grpRepeatEvery').hide();
                
            }
        });

        //$('#btnNo').on('click', function () {
        //    $('#confimationModal').modal('toggle');
        //});

        $('#eventModal').on('shown.bs.modal', function () {
            $('#txtTitle').focus();
        });
    }
    return {
        setupCalendar: setupCalendar
    };
})();