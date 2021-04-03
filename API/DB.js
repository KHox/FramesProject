export const INFO = {
    FrameSystem: {
        type: 'folder',
        items: {
            SwitchableElement: {
                addClassName: true,
                extends: '<a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement">HTMLElement</a>',
                import: './FrameSystem/index.js',
                methods: {
                    switchOn: {
                        description: `Включает элемент<br>
                        На элементе возникает всплывающее событие <span class="word">SwitchOn</span>`
                    },
                    switchOff: {
                        description: `Выключает элемент<br>
                        На элементе возникает всплывающее событие <span class="word">SwitchOff</span>`
                    },
                    toggleSwitch: {
                        description: `Переключает элемент<br>
                        <span class="word">Включён</span> => <span class="word">выключен</span> | <span class="word">Выключен</span> => <span class="word">включён</span><br>
                        Возникает соответствующее событие`
                    }
                },
                properties: {
                    public: {
                        isOn: {
                            lines: {
                                type: 'boolean',
                                readonly: ''
                            },
                            description: 'Возвращает логическое значение включён ли элемент'
                        }
                    },
                    protected: {
                        _switchMode: {
                            lines: {
                                type: 'boolean'
                            },
                            description: `Свойство <span class="word">isOn</span> возвращает значение из этого поля<br>
                            Лучше не трогать даже внутри класса, чтобы не нарушить работу, и пользоваться предоставленными методами выключения/выключения элемента`
                        }
                    }
                }
            },
            EventableElement: {
                addClassName: true,
                extends: 'SwitchableElement',
                import: './FrameSystem/index.js',
                methods: {
                    onOpen: {
                        description: 'Этот метод вызывается при открытии объекта <a data-key="Frame">Frame</a>'
                    },
                    onKeyDown: {
                        args: {
                            keys: {
                                type: 'object',
                                description: `Объект полями которого являются названия нажатых клавиш<br>
                                Если клавиша нажата, то значением поля является <span class="bool">true</span>`
                            }
                        },
                        description: `Срабатывает при нажатии клавиши<br>
                        Не срабатывает, если элемент выключен`
                    },
                    onKeyUp: {
                        args: {
                            keys: {
                                type: 'object',
                                description: `Объект полями которого являются названия отжатых клавиш<br>
                                Если клавиша отжата, то значением поля является <span class="bool">true</span>`
                            }
                        },
                        description: `Срабатывает при отпускании клавиши<br>
                        Не срабатывает, если элемент выключен`
                    },
                    onMouseMove: {
                        args: {
                            x: {
                                type: 'number',
                                description: 'Дельта перемещения мыши по оси X'
                            },
                            y: {
                                type: 'number',
                                description: 'Дельта перемещения мыши по оси Y'
                            }
                        },
                        description: `Вызывается при передвижении мыши<br>
                        Не срабатывает, если элемент выключен`
                    },
                    onMouseDown: {
                        args: {
                            event: {
                                type: 'object',
                                description: 'Объект события мыши'
                            }
                        },
                        description: `Вызывается при нажатии кнопки мыши<br>
                        Объект события содержит свойства:<br>
                        x, y - координаты мыши, относительно верхнего левого угла окна<br>
                        buttons - побитово нажатые клавиши (см. <a href="https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent">MouseEvent</a>)<br>
                        isDown - всегда равно <span class="bool">true</span><br>
                        Не срабатывает, если элемент выключен`
                    },
                    onMouseUp: {
                        args: {
                            event: {
                                type: 'object',
                                description: 'Объект события мыши'
                            }
                        },
                        description: `Вызывается, когда кнопка мыши отпущена<br>
                        Объект события содержит свойства:<br>
                        x, y - координаты мыши, относительно верхнего левого угла окна<br>
                        buttons - побитово отпущенные клавиши (см. <a href="https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent">MouseEvent</a>)<br>
                        isUp - всегда равно <span class="bool">true</span><br>
                        Не срабатывает, если элемент выключен`
                    },
                    onFocus: {
                        description: `Вызывается когда пользователь переключается на окно<br>
                        Событие может возникнуть при одновременном нажатии левого шифта и клавиши "Tab" или при клике на окно<br>
                        Не срабатывает, если элемент выключен`
                    },
                    onBlur: {
                        description: `Вызывается когда пользователь уводит фокус с окна (переключается на другое или кликает вне окна)<br>
                        Событие может возникнуть при одновременном нажатии левого шифта и клавиши "Tab" или при клике вне окна<br>
                        Не срабатывает, если элемент выключен`
                    },
                    onResize: {
                        description: `Вызывается при изменении размеров окна<br>
                        Свойства <span class="word">width</span> и <span class="word">height</span> объекта <a data-key="Frame">Frame</a> будут автоматически изменены<br>
                        (При фиксированном режиме окна событие не будет срабатывать, так как размеры окна не меняются)<br>
                        Не срабатывает, если элемент выключен`
                    },
                    onSwitchOn: {
                        args: {
                            component: {
                                type: '<a data-key="FrameComponent">FrameComponent</a>',
                                description: 'Компонент окна, который стал включен'
                            }
                        },
                        description: `Вызывается при включении одного из компонентов окна<br>
                        Даже если текущий элемент <span class="word">выключен</span>`
                    },
                    onSwitchOff: {
                        args: {
                            component: {
                                type: '<a data-key="FrameComponent">FrameComponent</a>',
                                description: 'Компонент окна, который стал выключен'
                            }
                        },
                        description: `Вызывается при выключении одного из компонентов окна<br>
                        Даже если текущий элемент <span class="word">выключен</span>`
                    }
                }
            },
            FrameComponent: {
                addClassName: true,
                extends: 'EventableElement',
                import: './FrameSystem/index.js',
                methods: {
                    init: {
                        args: {
                            frame: {
                                type: `<a data-key="Frame">Frame</a>`,
                                description: `Окно, в которое добавляется компонент`
                            }
                        },
                        description: `Автоматически вызывается окном при добавлении в него компонента`
                    },
                    delete: {
                        description: `Удаляет компонент из окна`
                    },
                    tick: {
                        description: `Вызывается окном, используется для обновлений компонента<br>
                        (Для работы со значениями зависящими от времени используйте объект <span class="word">time</span> предоставляемый окном)`
                    }
                },
                properties: {
                    name: {
                        readonly: true,
                        type: 'string',
                        description: `Имя компонента<br>
                        По умолчанию является именем класса, к которому принадлежит компонент`
                    },
                    tickPriority: {
                        readonly: true,
                        type: 'number',
                        description: `Приоритет обновления компонента<br>
                        Чем больше значение, тем позже других обновится компонент`
                    }
                }
            },
            FrameRenderableComponent: {
                addClassName: true,
                extends: 'FrameComponent',
                import: './FrameSystem/index.js',
                methods: {
                    initRender: {
                        returns: 'any',
                        description: `Вызывается для инициализации контекста (this) для метода <span class="word">render</span><br>
                        Если методу render нужен заранее сгенерированный контекст, то метод <span class="word">initRender</span> должен возвращать этот контекст<br>
                        Этот метод выполняется на стороне <a href="https://developer.mozilla.org/en-US/docs/Web/API/Worker">Worker</a>'a поэтому возвращаемый объект не сможет содержать ссылок на текущее окружение`
                    },
                    preRender: {
                        returns: 'any',
                        description: `Возвращённые методом <span class="word">preRender</span> данные передадутся методу <span class="word">render</span> в качестве объекта <span class="word">"data"</span>`
                    },
                    render: {
                        returns: 'any',
                        description: `Основной вычислительный метод<br>
                        Получает контекст от метода <span class="word">initRender</span> и данные из метода <span class="word">preRender</span> в качестве объекта <span class="word">"data"</span><br>
                        Должен возвращать вычисленные данные для метода отрисовки <span class="word">postRender</span>`
                    },
                    postRender: {
                        args: {
                            ctx: {
                                type: 'CanvasRenderingContext2D'
                            },
                            calculatedData: {
                                type: 'any'
                            }
                        }
                    }
                },
                properties: {
                    renderPriority: {
                        readonlye: true,
                        type: 'number',
                        description: `Приоритет обновления рендера компонента<br>
                        Чем больше значение, тем позже других обновится компонент`
                    }
                }
            },
            Frame: {}
        }
    },
    Library: {
        type: 'folder',
        items: {
            Classes: {
                type: 'folder',
                items: {
                    CoordData: {},
                    InputFormater: {},
                    TasksManager: {},
                    Transform: {},
                    Vec2: {}
                }
            },
            Functions: {},
            Objects: {},
            Math: {},
            Arrays: {}
        }
    },
    Components: {
        type: 'folder',
        items: {
            DrawingMapSystem: {
                type: 'folder',
                items: {
                    DrawingMapSystem: {}
                }
            },
            FpsUpsSystem: {},
            MyComponent: {},
            PlayerBehaivor: {},
            PseudoMap: {}
        }
    }
};