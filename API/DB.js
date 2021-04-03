export const INFO = {
    FrameSystem: {
        type: 'folder',
        items: {
            SwitchableElement: {
                addClassName: true,
                extends: '<a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement">HTMLElement</a>',
                import: './FrameSystem/index.js',
                description: `Простейший класс, дающий элементу возможность включаться и выключаться`,
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
                                readonly: '',
                                type: 'boolean'
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
                            Лучше не трогать даже внутри класса, чтобы не нарушить работу, и пользоваться предоставленными методами включения/выключения элемента`
                        }
                    }
                }
            },
            EventableElement: {
                addClassName: true,
                extends: 'SwitchableElement',
                import: './FrameSystem/index.js',
                description: `Используется лишь как интерфейс взаимодействия, гарантирующий окну, что его компоненты имеют методы обработки событий`,
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
                description: `Простейший компонент окна, использующийся для его обновления<br>
                Вы можете наследовать от этого класса, если вашему компоненту не нужно ничего отрисоваывать<br>
                Иначе следует использовать более расширенные класс <a data-key="FrameRenderableComponent">FrameRenderableComponent</a>`,
                methods: {
                    init: {
                        args: {
                            frame: {
                                type: `<a data-key="Frame">Frame</a>`,
                                description: `Окно, в которое добавляется компонент`
                            }
                        },
                        description: `Автоматически вызывается окном при добавлении в него компонента<br>
                        Устанавливает защищённоё свойство <span class="word">_frame</span> для компонента`
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
                    public: {
                        name: {
                            lines: {
                                readonly: '',
                                type: 'string',
                            },
                            description: `Имя компонента<br>
                            По умолчанию является именем класса, к которому принадлежит компонент`
                        },
                        tickPriority: {
                            lines: {
                                readonly: '',
                                type: 'number',
                            },
                            description: `Приоритет обновления компонента<br>
                            Чем больше значение, тем позже других обновится компонент, по умолчанию равно единице`
                        }
                    },
                    protected: {
                        _frame: {
                            lines: {
                                type: `<a data-key="Frame">Frame</a>`
                            },
                            description: `Ссылка на окно, в которое встроен компонент<br>
                            Используйте для доступа к свойствам окна внутри компонента`
                        },
                        _tickPriority: {
                            lines: {
                                type: 'number'
                            },
                            description: `Число, которое возвращает свойство <span class="word">tickPriority</span><br>
                            Можно задавать в конструкторе класса или методе <span class="word"><a data-key="EventableElement">EventableElement</a>.onOpen</span> для устоновки приоритета компонента`
                        }
                    }
                }
            },
            FrameRenderableComponent: {
                addClassName: true,
                extends: 'FrameComponent',
                import: './FrameSystem/index.js',
                description: `Компонент окна, использующийся для отрисовки частей кадра`,
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
                                type: '<a href="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D">CanvasRenderingContext2D</a>',
                                description: `Контекст элемента <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement">HTMLCanvasElement</a><br>
                                Используйте его для отрисовки кадра`
                            },
                            calculatedData: {
                                type: 'any',
                                description: `Данные вычисленные методом <span class="word">render</span>`
                            }
                        },
                        description: `Используется после всех вычислительных операций<br>
                        Используйте этот метод для отрисовки кадра`
                    }
                },
                properties: {
                    public: {
                        renderPriority: {
                            lines: {
                                readonly: '',
                                type: 'number'
                            },
                            description: `Приоритет обновления рендера компонента<br>
                            Чем больше значение, тем позже других обновится компонент`
                        }
                    },
                    protected: {
                        _renderPriority: {
                            lines: {
                                type: 'number'
                            },
                            description: `Число, которое возвращает свойство <span class="word">renderPriority</span><br>
                            Можно задавать в конструкторе класса или методе <span class="word"><a data-key="EventableElement">EventableElement</a>.onOpen</span> для устоновки приоритета рендера компонента`
                        }
                    }
                }
            },
            Frame: {
                addClassName: true,
                extends: 'SwitchableElement',
                import: './FrameSystem/index.js',
                description: `Класс окна<br>
                Можно встраивать на страницу и как HTML: &#x3C;<span class="html">frame-element</span>&#x3E;&#x3C;/<span class="html">frame-element</span>&#x3E;<br>
                Можно создать используя конструктор и уже после вставить в документ`,
                methods: {
                    addComponents: {
                        args: {
                            components: {
                                type: `Array&#x3C;<a data-key="FrameComponent">FrameComponent</a>|<a data-key="FrameRenderableComponent">FrameRenderableComponent</a>&#x3E;`,
                                description: `Массив компонентов, которые должны принадлежать окну`
                            }
                        },
                        description: `Добавляет массив компонентов в окно для дальнейшей работы`
                    },
                    getComponents: {
                        args: {
                            name: {
                                type: 'string',
                                description: 'Имя компонента'
                            }
                        },
                        returns: 'Array&#x3C;<a data-key="FrameComponent">FrameComponent</a>&#x3E;',
                        description: `Возвращает массив компонентов по полученному имени`
                    },
                    deleteComponent: {
                        args: {
                            component: {
                                type: `<a data-key="FrameComponent">FrameComponent</a>|<a data-key="FrameRenderableComponent">FrameRenderableComponent</a>`,
                                description: `Компонент, который нужно удалить из окна`
                            }
                        },
                        description: `Удаляет переданный компонент из окна и вызывает его метод <span class="word">delete</span>`
                    },
                    close: {
                        isAsync: true,
                        returns: `<a href="https://learn.javascript.ru/promise-basics">Promise</a>`,
                        description: `Закрывает окно`
                    },
                    open: {
                        isAsync: true,
                        args: {
                            ['?where']: {
                                type: '<a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement">HTMLElement</a>',
                                description: `Необязательный аргумент<br>
                                Элемент, в котором должно открыться окно`
                            }
                        },
                        returns: `<a href="https://learn.javascript.ru/promise-basics">Promise</a>`,
                        description: `Открывает окно внутри переданного элемента<br>
                        Если окно уже находится в HTML, то его можно открыть и не передавая элемент родителя`
                    },
                    resize: {
                        description: `Обновляет размеры окна, если не установлен фиксированные режим<br>
                        Автоматически вызывается при изменении размеров страницы`
                    },
                    setSize: {
                        args: {
                            width: {
                                type: 'number',
                                description: `Ширина окна`
                            },
                            height: {
                                type: 'number',
                                description: `Высота окна`
                            }
                        },
                        description: `Устанавливает фиксированные размеры для окна`
                    },
                    tick: {
                        description: `Вызывается автоматически<br>
                        Обновляет состоянее окна и всех компонентов, вызывает все нужные обработчики событий`
                    },
                    render: {
                        description: `Вызывается автоматически<br>
                        Обновляет состояние рендера и вызывает у компонентов соответсвтующиее методы<br>
                        Подробнее: <a data-key="FrameRenderableComponent">FrameRenderableComponent</a>`
                    },
                    toggleFullsceen: {
                        isAsync: true,
                        description: `Переключает полноэкранный режим<br>
                        Полноэкранный режим окна можно автоматически включить одновременным нажатием клавиш <span class="word">Alt</span>+<span class="word">Enter</span><br>
                        Выйти из полноэкранного режима можно так же, или переключившись на другое окно сочетанием клавиш <span class="word">Shift</span>+<span class="word">Tab</span>`
                    },
                    fullscreenOff: {
                        isAsync: true,
                        description: `Выходит из полноэкранного режими`
                    },
                    fullscreenOn: {
                        isAsync: true,
                        description: `Открывает окно на весь экран`
                    }
                },
                properties: {
                    public: {
                        ctx: {
                            lines: {
                                readonly: ``,
                                type: `<a href="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D">CanvasRenderingContext2D</a>`
                            },
                            description: `Контекст холста окна`
                        },
                        time: {
                            lines: {
                                readonly: ``,
                                type: `object`,
                                ['object.currentFrame']: `{number} - <span class="word">Время текущего обновления рендера</span>`,
                                ['object.currentTick']: `{number} - <span class="word">Время текущего обновления состояния</span>`,
                                ['object.deltaFrame']: `{number} - <span class="word">Разница по времени между последним обновлением рендера и текущим</span>`,
                                ['object.deltaTick']: `{number} - <span class="word">Разница по времени между последним обновлением состояния и текущим</span>`,
                                ['object.lastFrame']: `{number} - <span class="word">Время предыдущего обновления рендера</span>`,
                                ['object.lastTick']: `{number} - <span class="word">Время предыдущего обновления состояния</span>`,
                            },
                            description: `Объект времени, используйте данные из него для изменения велечин с постоянной скоростью`
                        },
                        isFullscreened: {
                            lines: {
                                readonly: ``,
                                type: `boolean`
                            },
                            description: `Возвращает логическое значение, <span class="word">true</span> - если окно открыто на весь экран`
                        },
                        width: {
                            lines: {
                                readonly: ``,
                                type: `number`
                            },
                            description: `Возвращает текущую ширину окна`
                        },
                        height: {
                            lines: {
                                readonly: ``,
                                type: `number`
                            },
                            description: `Возвращает текущую высоту окна`
                        }
                    }
                }
            }
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