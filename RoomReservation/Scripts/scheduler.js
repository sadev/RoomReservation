var schedulerNS = schedulerNS || {};

var urlReferrer = window.location.href.substring(0, window.location.href.indexOf("Home"));

schedulerNS.calendar = (function () {

    var currentEvent = null;

    //Calendar setup
    function setupCalendar() {
        getRooms();
        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next,today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
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
            minTime: '08:00',
            weekends: false,
            select: function (start, end) {
                $('#txtTitle').val('');
                currentEvent = {
                    start: start,
                    end: end
                };
                resetRepeatingForm();
                checkSelectedDays(moment(currentEvent.start).day());
                $('#calendar').fullCalendar('unselect');
                $('#btnDelete').hide();
                $('#btnDeleteAll').hide();
                $('#eventModal').modal('toggle');
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
                                        var days = response.RepeatsOn.split(',');
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
                        checkSelectedDays(moment(currentEvent.start).day());
                        $('#btnDelete').show();
                        $('#btnDeleteAll').hide();
                    }
                    $("#slcRooms").val(event.roomId);
                    $("#cbRepeatingEvent").prop('disabled', true);
                    $('#eventModal').modal('toggle');
                    $('#txtTitle').val(event.title);
                }
            },
            eventDrop: function (event, revertFunc) {
                updateEvent(event);
            },
            eventResize: function (event, revertFunc) {
                updateEvent(event);
            },
            viewRender: function(view, element) {
                if (view.name === 'month') {
                    view.calendar.options.selectable = false;
                    view.calendar.options.selectHelper = false;
                    view.calendar.options.editable = false;
                } else {
                    view.calendar.options.selectable = true;
                    view.calendar.options.selectHelper = true;
                    view.calendar.options.editable = true;
                }
                $('#calendar').fullCalendar('refetchEvents');
            },
            events: function (start, end, timezone, callback) {
                $.ajax({
                    type: 'GET',
                    url: urlReferrer + 'api/events',
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
                                    roomId: value.RoomID,
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
                                    roomId: value.RoomID,
                                    repeatConfigId: value.RepeatConfigID
                                });
                            }

                        });
                        callback(events);
                    }
                });
            },
            
            eventRender: function (event, element, view) {
                if (view.name === 'month') {
                    event.editable = false;
                } else {
                    if ($('#hdnUserName').val() === event.person) {
                        event.editable = true;
                    }   
                }
                $('.popover').remove();
            },

            eventAfterRender: function (event, element, view) {
                element.popover({
                    container: "body",
                    html: true,
                    trigger: 'hover',
                    title: 'Reservation',
                    placement: 'right',
                    content: '<b>Title:</b> ' + event.title + '<br /><b>Start:</b> ' + event.start.format('HH:mm') + '<br /><b>End:</b> ' + event.end.format('HH:mm') + '<br /><b>Creator:</b> ' + event.person + '<br /><b>Room:</b> ' + getRoomById(event.roomId),
                });
            }
        });

        //jQuery events
        $('#btnSave').on('click', function () {
            if (validateForm()) {
                if (!$('#cbRepeatingEvent').is(":checked")) {
                    if (!currentEvent.id) {
                        var newEvent = {
                            Title: $('#txtTitle').val(),
                            DateFrom: currentEvent.start.format(),
                            DateTo: currentEvent.end.format(),
                            Person: $('#hdnUserName').val(),
                            RoomID: $('#slcRooms').val(),
                            RepeatConfigID: '-999'
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
                        updateEvent(currentEvent, $('#txtTitle').val(), $('#slcRooms').val());
                    }
                    $('#eventModal').modal('toggle');
                } else {
                    var repeatsOn = [];
                    $('#divDaysOfWeek input:checked').each(function () {
                        repeatsOn.push($(this).val());
                    });
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
                        RoomId: $('#slcRooms').val()
                    };
                    $.ajax({
                        type: 'POST',
                        url: urlReferrer + 'api/events/repeatconfig',
                        contentType: 'application/json',
                        data: JSON.stringify(result),
                        success: function (response) {
                            $('#calendar').fullCalendar('refetchEvents');
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            alert('Error, could not save events!');
                        }
                    });
                    $('#eventModal').modal('toggle');
                }
            }
        });

        function getRoomById(roomId) {
           return $("#slcRooms option[value='" + roomId + "']").text();
        }

        $('#txtTitle').keypress(function () {
            $(this).closest('.form-group').removeClass('has-error');
            $("#titleSpan").css("display", "none");
        });

        $("#divDaysOfWeek input[type=checkbox]").click(function () {
            $('#divDaysOfWeek').closest('.form-group').removeClass('has-error');
            $("#daysSpan").css("display", "none");
        });

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
        });

        $("#cbRepeatingEvent").change(function () {
            if (this.checked) {
                $('#repeatingEventForm').show();
                var dayChecked = moment(currentEvent.start).day();
                $('#divDaysOfWeek input[type=checkbox]').each(function () {
                    if ($(this).val() === dayChecked.toString()) {
                        $(this).prop('checked', true);
                    }
                });
            } else {
                $('#slcRepeat').val('weekly');
                $('#divDaysOfWeek').show();
                $('#slcRepeatEvery').val('1');
                $("#dtEnds-input").val(moment().add('months', 1).format('MM/DD/YYYY'));
                checkSelectedDays(moment(currentEvent.start).day());
                resetValidation();
                $('#repeatingEventForm').hide();
                $('#grpRepeatEvery').show();
            }
        });

        $('#slcRepeat').on('change', function () {
            if (this.value === 'weekly') {
                $('#divDaysOfWeek').show();
                $('#grpRepeatEvery').show();
                var day = moment(currentEvent.start).day();
                $('#divDaysOfWeek input[type=checkbox]').each(function () {
                    if ($(this).val() === day.toString()) {
                        $(this).prop('checked', true);
                    }
                });
            } else {
                $('#divDaysOfWeek').hide();
                $('#grpRepeatEvery').hide();
                $('#divDaysOfWeek').closest('.form-group').removeClass('has-error');
                $("#daysSpan").css("display", "none");
            }
        });

        $('#dtEnds').keypress(function () {
            $('#dtEnds-input').closest('.form-group').removeClass('has-error');
            $("#dateSpan").css("display", "none");
        });

        $('#dtEnds').on('change.dp', function () {
            $('#dtEnds-input').closest('.form-group').removeClass('has-error');
            $("#dateSpan").css("display", "none");
        });

        //Helper functions
        function checkSelectedDays(day) {
            $('#divDaysOfWeek input[type=checkbox]').each(function () {
                if ($(this).val() === day.toString()) {
                    $(this).prop('checked', true);
                }
            });
        }
 
        function resetValidation() {
            $('#txtTitle').closest('.form-group').removeClass('has-error');
            $("#titleSpan").css("display", "none");
            $('#divDaysOfWeek').closest('.form-group').removeClass('has-error');
            $("#daysSpan").css("display", "none");
            $('#dtEnds-input').closest('.form-group').removeClass('has-error');
            $("#dateSpan").css("display", "none");
        }

        function resetRepeatingForm() {
            $("#cbRepeatingEvent").prop('disabled', false);
            $("#cbRepeatingEvent").prop('checked', false);
            $('#slcRepeat').val('weekly');
            $('#divDaysOfWeek').show();
            $('#slcRepeatEvery').val('1');
            $("#slcRooms").val($("#slcRooms option:first").val());
            $("#dtEnds-input").val(moment().add('months', 1).format('MM/DD/YYYY'));
            $('#divDaysOfWeek input:checked').each(function () {
                $(this).prop('checked', false);
            });
            resetValidation();
            $('#repeatingEventForm').hide();
            $('#grpRepeatEvery').show();
        }

        function validateForm() {
            var result = true;
            if (!$('#txtTitle').val()) {
                $('#txtTitle').closest('.form-group').addClass('has-error');
                $("#titleSpan").css("display", "block");
                result = false;
            }
            if ($('#slcRepeat').val() === 'weekly' && $('#divDaysOfWeek input:checked').length < 1) {
                $('#divDaysOfWeek').closest('.form-group').addClass('has-error');
                $("#daysSpan").css("display", "block");
                result = false;
            }
            if (!$("#dtEnds-input").val()) {
                $('#dtEnds-input').closest('.form-group').addClass('has-error');
                $("#dateSpan").css("display", "block");
                $("#dateSpan").text('Date is required');
                result = false;
            } else if (!validateDate($("#dtEnds-input").val())) {
                $('#dtEnds-input').closest('.form-group').addClass('has-error');
                $("#dateSpan").css("display", "block");
                $("#dateSpan").text('Date is not valid');
                result = false;
            }
            return result;
        }

        function validateDate(date) {
            var dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
            return dateRegex.test(date);
        }

        function updateEvent(event, newTitle, roomId) {
            var newEvent = {
                Title: newTitle ? newTitle : event.title,
                DateFrom: event.start.format(),
                DateTo: event.end.format(),
                ID: event.id,
                Person: $('#hdnUserName').val(),
                RoomID: roomId ? roomId: event.roomId,
                RepeatConfigID: '-999'
            };

            $.ajax({
                type: 'PUT',
                url: urlReferrer + 'api/events/' + event.roomId,
                data: newEvent,
                success: function () {
                    $('#calendar').fullCalendar('refetchEvents');
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert('Error, could not update event!');
                }
            });
        }

        function getRooms() {
            $.ajax({
                type: 'GET',
                url: urlReferrer + 'api/events/room',
                dataType: 'json',
                contentType: 'application/json',
                success: function (data) {
                    var sel = $('#slcRooms').empty();
                    $.each(data, function (key, value) {
                        sel.append('<option value="' + value.ID + '">' + value.Title + '</option>');
                    });
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert('Error, Could not get Rooms from db!');
                }
            });
        }
    }
    return {
        setupCalendar: setupCalendar
    };
})();